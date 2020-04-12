#!/usr/bin/env node

require('dotenv').config()
require('docstring')
const os = require('os');

import { ArgumentParser } from 'argparse'
import { parse as TOML } from '@iarna/toml'
import fs = require('fs')
import path = require('path')

import request = require('request-promise')
import * as LinkHeader from 'http-link-header'

import Ajv = require('ajv')
const ajv = new Ajv()

function sleep(msecs) {
  return new Promise(resolve => setTimeout(resolve, msecs))
}

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
    this.parser.addArgument('--api-key', {help: 'The API key to access the Zotero API.'})
    this.parser.addArgument('--config', { type: arg.file, help: 'Configuration file (toml format). Note that ./zotero-cli.toml and ~/.config/zotero-cli/zotero-cli.toml is picked up automatically.' })
    this.parser.addArgument('--user-id', { type: arg.integer, help: 'The id of the user library.' })
    this.parser.addArgument('--group-id', { type: arg.integer, help: 'The id of the group library.' })
    this.parser.addArgument('--indent', { type: arg.integer, help: 'Identation for json output.' })

    const subparsers = this.parser.addSubparsers({ title: 'commands', dest: 'command', required: true })
    // add all methods that do not start with _ as a command
    for (const cmd of Object.getOwnPropertyNames(Object.getPrototypeOf(this)).sort()) {
      if (typeof this[cmd] !== 'function' || cmd[0] !== '$') continue

      const sp = subparsers.addParser(cmd.slice(1).replace(/_/g, '-'), { description: this[cmd].__doc__, help: this[cmd].__doc__ })
      // when called with an argparser, the command is expected to add relevant parameters and return
      // the command must have a docstring
      this[cmd](sp)
    }

    this.args = this.parser.parseArgs()

    // pick up config
    const config = this.args.config || 'zotero-cli.toml'
    // this.config = fs.existsSync(config) ? TOML(fs.readFileSync(config, 'utf-8')) : {}
    if (fs.existsSync(config)) {
        this.config = TOML(fs.readFileSync(config, 'utf-8'));
    } else {
	const configOS = os.homedir() + "/.config/zotero-cli/zotero-cli.toml";
	if (fs.existsSync(configOS)) {
            this.config = TOML(fs.readFileSync(configOS, 'utf-8'));
	} else {
	    // What now?
	};
    };
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
    let chunk = await this.get(uri, { resolveWithFullResponse: true, params })
    let data = chunk.body

    let link = chunk.headers.link && LinkHeader.parse(chunk.headers.link).rel('next')
    while (link && link.length && link[0].uri) {
      if (chunk.headers.backoff) await sleep(parseInt(chunk.headers.backoff) * 1000)

      chunk = await request({
        uri: link[0].uri,
        headers: this.headers,
        json: true,
        resolveWithFullResponse: true,
      })
      data = data.concat(chunk.body)
      link = chunk.headers.link && LinkHeader.parse(chunk.headers.link).rel('next')
    }
    return data
  }

  async get(uri, options: { userOrGroupPrefix?: boolean, params?: any, resolveWithFullResponse?: boolean, json?: boolean } = {}) {
    if (typeof options.userOrGroupPrefix === 'undefined') options.userOrGroupPrefix = true
    if (typeof options.params === 'undefined') options.params = {}
    if (typeof options.json === 'undefined') options.json = true

    let prefix = ''
    if (options.userOrGroupPrefix) prefix = this.args.user_id ? `/users/${this.args.user_id}` : `/groups/${this.args.group_id}`

    const params = Object.keys(options.params).map(param => {
      let values = options.params[param]
      if (!Array.isArray(values)) values = [ values ]
      return values.map(v => `${param}=${encodeURI(v)}`).join('&')
    }).join('&')

    return request({
      uri: `${this.base}${prefix}${uri}${params ? '?' + params : ''}`,
      headers: this.headers,
      json: options.json,
      resolveWithFullResponse: options.resolveWithFullResponse,
    })
  }

  async post(uri, data) {
    const prefix = this.args.user_id ? `/users/${this.args.user_id}` : `/groups/${this.args.group_id}`

    return request({
      method: 'POST',
      uri: `${this.base}${prefix}${uri}`,
      headers: {...this.headers, 'Content-Type': 'application/json'},
      body: data,
    })
  }

  async put(uri, data) {
    const prefix = this.args.user_id ? `/users/${this.args.user_id}` : `/groups/${this.args.group_id}`

    return request({
      method: 'PUT',
      uri: `${this.base}${prefix}${uri}`,
      headers: {...this.headers, 'Content-Type': 'application/json'},
      body: data,
    })
  }

  async patch(uri, data, version?: number) {
    const prefix = this.args.user_id ? `/users/${this.args.user_id}` : `/groups/${this.args.group_id}`

    const headers = {...this.headers, 'Content-Type': 'application/json'}
    if (typeof version !== 'undefined') headers['If-Unmodified-Since-Version'] = version

    return request({
      method: 'PATCH',
      uri: `${this.base}${prefix}${uri}`,
      headers,
      body: data,
    })
  }

  async count(uri, params = {}) {
    return (await this.get(uri, { resolveWithFullResponse: true, params })).headers['total-results']
  }

  show(v) {
    console.log(JSON.stringify(v, null, this.args.indent).replace(new RegExp(this.args.api_key, 'g'), '<API-KEY>'))
  }

  /// THE COMMANDS ///

  async $key(argparser = null) {
    /** Show details about this API key. (API: /keys ) */

    if (argparser) return

    this.show(await this.get(`/keys/${this.args.api_key}`, { userOrGroupPrefix: false }))
  }

  async $collection(argparser = null) {
    /** Retrieve information about a specific collection --key KEY (API: /collection/KEY or /collection/KEY/tags)   */

    if (argparser) {
      argparser.addArgument('--key', { required: true,  help: 'The key of the item.' })
      argparser.addArgument('--tags', { action: 'storeTrue', help: 'Display tags present in the collection.' })
      argparser.addArgument('--add', { action: 'storeTrue', help: 'Add items to this collection.' })
      argparser.addArgument('itemkeys', { nargs: '*'})
      return
    }

    if (this.args.tags && this.args.add) {
      this.parser.error('--tags cannot be combined with --add')
      return
    }
    if (this.args.add && !this.args.itemkeys.length) {
      this.parser.error('--add requires item keys')
      return
    }
    if (!this.args.add && this.args.itemkeys.length) {
      this.parser.error('unexpected item keys')
      return
    }

    if (this.args.add) {
      for (const itemKey of this.args.itemkeys) {
        const item = await this.get(`/items/${itemKey}`)
        if (item.data.collections.includes(this.args.key)) continue
        await this.patch(`/items/${itemKey}`, JSON.stringify({ collections: item.data.collections.concat(this.args.key) }), item.version)
      }
      return
    }
    this.show(await this.get(`/collections/${this.args.key}${this.args.tags ? '/tags' : ''}`))
  }

  async $collections(argparser = null) {
    /** Retrieve a list of collections. (API: /collections or /collection/top) */

    if (argparser) {
      argparser.addArgument('--top', { action: 'storeTrue', help: 'Show only collection at top level.' })
      return
    }

    this.show(await this.get(`/collections${this.args.top ? '/top' : ''}`))
  }

  async $items(argparser = null) {
    /** Retrieve a list of items items from the library, e.g. collection/top. (API: /items/...) */

    let items

    if (argparser) {
      argparser.addArgument('--count', { action: 'storeTrue', help: 'TODO: document' })
      argparser.addArgument('--all', { action: 'storeTrue', help: 'TODO: document' })
      argparser.addArgument('--filter', { type: arg.json, help: 'TODO: document' })
      argparser.addArgument('--collection', {help: 'Retrive list of items for collection'})
      argparser.addArgument('--top', { action: 'storeTrue', help: 'TODO: document' })
      argparser.addArgument('--validate', { type: arg.path, help: 'json-schema file for all itemtypes, or directory with schema files, one per itemtype' })
      return
    }

    if (this.args.count && this.args.validate) {
      this.parser.error('--count cannot be combined with --validate')
      return
    }

    const collection = this.args.collection ? `/collections/${this.args.collection}` : ''

    if (this.args.count) {
      console.log(await this.count(`${collection}/items${this.args.top ? '/top' : ''}`, this.args.filter || {}))
      return
    }

    const params = this.args.filter || {}

    if (this.args.top) {
      items = await this.get(`${collection}/items/top`, { params })
    } else if (params.limit) {
      items = await this.get(`${collection}/items`, { params })
    } else {
      items = await this.all(`${collection}/items`, params)
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

        if (!validate(item)) this.show(validate.errors)
      }

    } else {
      this.show(items)
    }
  }

  async $item(argparser = null) {
    /** Retrieve children for item --key KEY. (API: /items/KEY/ or /items/KEY/children) */
    if (argparser) {
      argparser.addArgument('--key', { required: true,  help: 'The key of the item.' })
      argparser.addArgument('--children', { action: 'storeTrue', help: 'TODO: document' })
      argparser.addArgument('--filter', { type: arg.json, help: 'TODO: document' })
      return
    }

    const params = this.args.filter || {}

    if (this.args.children) {
      this.show(await this.get(`/items/${this.args.key}/children`, { params }))
    } else {
      this.show(await this.get(`/items/${this.args.key}`, { params }))
    }
  }

  async $publications(argparser = null) {
    /** Return a list of items in publications (user library only). (API: /publications/items) */

    if (argparser) return

    const items = await this.get('/publications/items')
    this.show(items)
  }

  async $trash(argparser = null) {
    /** Return a list of items in the trash. */

    if (argparser) return

    const items = await this.get('/items/trash')
    this.show(items)
  }

  async $tags(argparser = null) {
    /** Return a list of tags in the library. Options to filter and count tags. (API: /tags) */

    if (argparser) {
      argparser.addArgument('--filter', {help: 'TODO: document'})
      argparser.addArgument('--count', { action: 'storeTrue', help: 'TODO: document' })
      return
    }

    const tags = (await this.all('/tags')).map(tag => tag.tag).sort()

    if (this.args.count) {
      const params = this.args.filter || {}

      for (const tag of tags) {
        console.log(tag, await this.count('/items', {...params, tag }))
      }
    } else {
      this.show(tags)
    }
  }

  async $searches(argparser = null) {
    /** Return a list of the saved searches of the library. (API: /searches) */

    if (argparser) return

    const items = await this.get('/searches')
    this.show(items)
  }

  async $attachment(argparser = null) {
    /** Retrieve/save attachments for the item specified with --key KEY. (API: /items/KEY/file) */

    if (argparser) {
      argparser.addArgument('--key', { required: true,  help: 'The key of the item.'})
      argparser.addArgument('--save', { required: true, help: 'Filename to save attachment to'})
      return
    }

    fs.writeFileSync(this.args.save, await this.get(`/items/${this.args.key}/file`))
  }

  async $types(argparser = null) {
    /** Retrieve a list of items types available in Zotero. (API: /itemTypes) */

    if (argparser) return

    this.show(await this.get('/itemTypes', { userOrGroupPrefix: false } ))
  }

  async $fields(argparser = null) {
    /**
     * Retrieve a template with the fields for --type TYPE (API: /itemTypeFields, /itemTypeCreatorTypes) or all item fields (API: /itemFields).
     * Note that to retrieve a template, use 'create-item --template TYPE' rather than this command.
     */

    if (argparser) {
      argparser.addArgument('--type', {help: 'Display fields types for TYPE.'})
      return
    }

    if (this.args.type) {
      this.show(await this.get('/itemTypeFields', { params: { itemType: this.args.type }, userOrGroupPrefix: false } ))
      this.show(await this.get('/itemTypeCreatorTypes', { params: { itemType: this.args.type }, userOrGroupPrefix: false } ))
    } else {
      this.show(await this.get('/itemFields', { userOrGroupPrefix: false } ))
    }
  }

  async $create_item(argparser = null) {
    /** Create a new item or items. (API: /items/new) You can retrieve a template with the --template option.  */

    if (argparser) {
      argparser.addArgument('--template', {help: "Retrieve a template for the item you wish to create. You can retrieve the template types using the main argument 'types'."})
      argparser.addArgument('items', { nargs: '*', help: 'Json files for the items to be created.' })
      return
    }

    if (this.args.template) {
      this.show(await this.get('/items/new', { userOrGroupPrefix: false, params: { itemType: this.args.template } }))
      return
    }

    if (!this.args.items.length) this.parser.error('Need at least one item to create')

    for (const item of this.args.items) {
      console.log(await this.post('/items', fs.readFileSync(item)))
    }
  }

  async $update_item(argparser = null) {
    /** Update/replace an item (--key KEY), either update (API: patch /items/KEY) or replacing (using --replace, API: put /items/KEY). */

    if (argparser) {
      argparser.addArgument('--key', { required: true,  help: 'The key of the item.' })
      argparser.addArgument('--replace', { action: 'storeTrue', help: 'TODO: document' })
      argparser.addArgument('items', { nargs: 1, help: 'TODO: document' })
      return
    }

    for (const item of this.args.items) {
      await this[this.args.replace ? 'put' : 'patch'](`/items/${this.args.key}`, fs.readFileSync(item))
    }
  }

  async $get(argparser = null) {
    /** Make a direct query to the API. */

    if (argparser) {
      argparser.addArgument('--root', { action: 'storeTrue', help: 'TODO: document' })
      argparser.addArgument('uri', { nargs: '+', help: 'TODO: document' })
      return
    }

    for (const uri of this.args.uri) {
      this.show(await this.get(uri, { userOrGroupPrefix: !this.args.root }))
    }
  }
}

(new Zotero).run().catch(err => {
  console.log('error:', err)
  process.exit(1)
})
