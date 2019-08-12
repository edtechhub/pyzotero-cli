#!/usr/bin/env node

require('dotenv').config()
require('docstring')

import { ArgumentParser } from 'argparse'
import { parse as TOML } from '@iarna/toml'
import fs = require('fs')
import path = require('path')

import Promise = require('bluebird')
import zotero = require('zotero')
zotero.promisify(Promise.promisify.bind(Promise))

import request = require('request-promise')
import * as LinkHeader from 'http-link-header'

import Ajv = require('ajv')
const ajv = new Ajv()

const arg = new class {
  integer(v) {
    if (isNaN(parseInt(v))) throw new Error(`${JSON.stringify(v)} is not an integer`)
    return parseInt(v)
  }

  file(v) {
    if (!fs.existsSync(v) || !fs.lstatSync(v).isFile()) throw new Error(`${JSON.stringify(v)} is not a file`)
    return v
  }

  path(v) {
    if (!fs.existsSync(v)) throw new Error(`${JSON.stringify(v)} does not exist`)
    return v
  }

  json(v) {
    return JSON.parse(v)
  }
}

class Zotero {
  args: any
  parser: any
  config: any
  zotero: any
  base = 'https://api.zotero.org'
  headers = {
    'User-Agent': 'Zotero-CLI',
    'Zotero-API-Version': '3',
  }

  async run() {
    // global parameters for all commands
    this.parser = new ArgumentParser
    this.parser.addArgument('--api-key')
    this.parser.addArgument('--config', { type: arg.file })
    this.parser.addArgument('--user-id', { type: arg.integer })
    this.parser.addArgument('--group-id', { type: arg.integer })
    this.parser.addArgument('--indent', { type: arg.integer })

    const subparsers = this.parser.addSubparsers({ title: 'commands', dest: 'command', required: true })
    // add all methods that do not start with _ as a command
    for (const cmd of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      if (typeof this[cmd] !== 'function' || cmd[0] !== '$') continue

      const sp = subparsers.addParser(cmd.slice(1).replace(/_/g, '-'), { description: this[cmd].__doc__, help: this[cmd].__doc__ })
      // when called with an argparser, the command is expected to add relevant parameters and return
      // the command must have a docstring
      this[cmd](sp)
    }

    this.args = this.parser.parseArgs()

    // pick up config
    const config = this.args.config || 'zpapi.toml'
    this.config = fs.existsSync(config) ? TOML(fs.readFileSync(config, 'utf-8')) : {}

    // expand selected command
    const options = [].concat.apply([], this.parser._actions.map(action => action.dest === 'command' ? action.choices[this.args.command] : [ action ]))
    for (const option of options) {
      if (!option.dest) continue
      if ([ 'help', 'config' ].includes(option.dest)) continue

      if (this.args[option.dest] !== null) continue

      let value

      // first try explicit config
      if (typeof value === 'undefined' && this.args.config) {
        value = (this.config[this.args.command] || {})[option.dest.replace(/_/g, '-')]
        if (typeof value === 'undefined') value = this.config[option.dest.replace(/_/g, '-')]
      }

      // next, ENV vars. Also picks up from .env
      if (typeof value === 'undefined') {
        value = process.env[`ZOTERO_CLI_${option.dest.toUpperCase()}`] || process.env[`ZOTERO_${option.dest.toUpperCase()}`]
      }

      // last, implicit config
      if (typeof value === 'undefined') {
        value = (this.config[this.args.command] || {})[option.dest.replace(/_/g, '-')]
        if (typeof value === 'undefined') value = this.config[option.dest.replace(/_/g, '-')]
      }

      if (typeof value === 'undefined') continue

      if (option.type === arg.integer) {
        if (isNaN(parseInt(value))) this.parser.error(`${option.dest} must be numeric, not ${value}`)
        value = parseInt(value)

      } else if (option.type === arg.path) {
        if (!fs.existsSync(value)) this.parser.error(`${option.dest}: ${value} does not exist`)

      } else if (option.type === arg.file) {
        if (!fs.existsSync(value) || !fs.lstatSync(value).isFile()) this.parser.error(`${option.dest}: ${value} is not a file`)

      } else if (option.type === arg.json && typeof value === 'string') {
        try {
          value = JSON.parse(value)
        } catch (err) {
          this.parser.error(`${option.dest}: ${JSON.stringify(value)} is not valid JSON`)
        }

      } else if (option.choices) {
        if (! option.choices.includes(value)) this.parser.error(`${option.dest} must be one of ${option.choices}`)

      } else if (option.action === 'storeTrue' && typeof value === 'string') {
        const _value = {
            true: true,
            yes: true,
            on: true,

            false: false,
            no: false,
            off: false,
        }[value]
        if (typeof _value === 'undefined') this.parser.error(`%{option.dest} must be boolean, not ${value}`)
        value = _value

      } else {
        // string
      }

      this.args[option.dest] = value
    }

    if (! this.args.api_key) this.parser.error('no API key provided')
    this.headers['Zotero-API-Key'] = this.args.api_key

    if (this.args.user_id === null && this.args.group_id === null ) this.parser.error('You must provide exactly one of --user-id or --group-id')
    if (this.args.user_id !== null && this.args.group_id !== null) this.parser.error('You must provide exactly one of --user-id or --group-id')
    if (this.args.user_id === 0) this.args.user_id = (await this.get(`/keys/${this.args.api_key}`, { userOrGroupPrefix: false })).userID

    // using default=2 above prevents the overrides from being picked up
    if (this.args.indent === null) this.args.indent = 2

    // call the actual command
    await this['$' + this.args.command.replace(/-/g, '_')]()
  }

  async all(uri, params = {}) {
    console.log(uri, params)

    let chunk = await this.get(uri, { resolveWithFullResponse: true, params })
    let data = chunk.body

    let link = chunk.headers.link && LinkHeader.parse(chunk.headers.link).rel('next')
    while (link && link.uri) {
      chunk = await this.get(link.uri, { resolveWithFullResponse: true, params })
      data = data.concat(chunk.body)
      link = chunk.headers.link && LinkHeader.parse(chunk.headers.link).rel('next')
    }
    return data
  }

  async get(uri, options: { userOrGroupPrefix?: boolean, params?: any, resolveWithFullResponse?: boolean } = {}) {
    if (typeof options.userOrGroupPrefix === 'undefined') options.userOrGroupPrefix = true
    if (typeof options.params === 'undefined') options.params = {}

    let prefix = ''
    if (options.userOrGroupPrefix) prefix = this.args.user_id ? `/users/${this.args.user_id}` : `/groups/${this.args.group_id}`

    const params = Object.keys(options.params).map(param => {
      let values = options.params[param]
      if (Array.isArray(values)) values = [ values ]
      console.log('param:', param, ', values:', values)
      return values.map(encodeURI).join('&')
    }).join('&')

    return request({
      uri: `${this.base}${prefix}${uri}${params ? '?' + params : ''}`,
      headers: this.headers,
      json: true,
      resolveWithFullResponse: options.resolveWithFullResponse,
    })
  }

  /// THE COMMANDS ///

  async $key(argparser = null) {
    /** TODO: document */

    if (argparser) return

    console.log(JSON.stringify(await this.get(`/keys/${this.args.api_key}`, { userOrGroupPrefix: false }), null, this.args.indent))
  }

  async $items(argparser = null) {
    /** TODO: document */

    let items

    if (argparser) {
      argparser.addArgument('--count', { action: 'storeTrue' })
      argparser.addArgument('--all', { action: 'storeTrue' })
      argparser.addArgument('--filter', { type: arg.json })
      argparser.addArgument('--top', { action: 'storeTrue' })
      argparser.addArgument('--validate', { type: arg.path, help: 'json-schema file for all itemtypes, or directory with schema files, one per itemtype' })
      return
    }

    if (this.args.count && this.args.validate) {
      this.parser.error('--count cannot be combined with --validate')
      return
    }

    if (this.args.count) {
      items = this.get('/items', { resolveWithFullResponse: true, params: this.args.filter || {} })
      console.log(items.headers['Total-Results'])
      return
    }

    const params = this.args.filter || {}

    if (this.args.top) {
      items = await this.get('/items/top', { params })
    } else if (params.limit) {
      items = await this.get('/items', { params })
    } else {
      items = await this.all('/items', params)
    }

    if (this.args.validate) {
      if (!fs.existsSync(this.args.validate)) throw new Error(`${this.args.validate} does not exist`)

      const oneSchema = fs.lstatSync(this.args.validate).isFile()

      let validate = oneSchema ? ajv.compile(JSON.parse(fs.readFileSync(this.args.validate, 'utf-8'))) : null

      const validators = {}
      // still a bit rudimentary
      for (const item of items) {
        if (!oneSchema) {
          validate = validators[item.itemType] = validators[item.itemType] || ajv.compile(JSON.parse(fs.readFileSync(path.join(this.args.validate, `${item.itemType}.json`), 'utf-8')))
        }

        if (validate(item)) console.log(JSON.stringify(validate.errors, null, this.args.indent))
      }

    } else {
      console.log(JSON.stringify(items, null, this.args.indent))
    }
  }

  async $publications(argparser = null) {
    /** TODO: document */

    if (argparser) return

    const items = await this.get('/publications/items')
    console.log(JSON.stringify(items, null, this.args.indent))
  }

  async $trash(argparser = null) {
    /** TODO: document */

    if (argparser) return

    const items = await this.get('/items/trash')
    console.log(JSON.stringify(items, null, this.args.indent))
  }

  /*
  def tags(self, argparser=None):
    """TODO: document"""

    if argparser:
      argparser.add_argument('--filter')
      argparser.add_argument('--count')
      return

    args = json.loads(self.args.filter) if self.args.filter else {}
    tags = self.zotero.tags(**args)
    if not 'limit' in args: tags = self.zotero.everything(tags)

    print(json.dumps(tags, indent=self.args.indent))
  */

  async $searches(argparser = null) {
    /** TODO: document */

    if (argparser) return

    const items = await this.get('/searches')
    console.log(JSON.stringify(items, null, this.args.indent))
  }

  /*
  def saved_search(self, argparser=None):
    """TODO: document"""

    if argparser:
      argparser.add_argument('files', nargs='*')
      return

    if not self.args.files or len(self.args.files) == 0:
      self.parser.error('files are required for saved-search')
      return

    for search in self.args.files:
      print(f'Search file: {search}')

      with open(search) as f:
        searchdefs = json.load(f)
        for searchdef in searchdefs:
          print(f'   Adding: {mydef["name"]}')
          result = self.zotero.saved_search(mydef['name'], mydef['conditions'])
          print(json.dumps(result, indent=self.args.indent))
    print('Done')
  */
}

(new Zotero).run().catch(err => {
  console.log('error:', err)
  process.exit(1)
})
