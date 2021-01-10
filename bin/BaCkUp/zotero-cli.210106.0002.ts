
// Other URLs
// https://www.zotero.org/support/dev/web_api/v3/basics
// /keys/<key>	
// /users/<userID>/groups	

require('dotenv').config();
require('docstring');
const os = require('os');

const { Zotero } = require('./zotero-api-lib.ts');

import { ArgumentParser } from 'argparse'
const TOML = require('@iarna/toml');
const fs = require('fs');
const path = require('path');
const request = require('request-promise');
const { LinkHeader } = require('http-link-header');
const ajv = require('ajv');
const { parse } = require("args-any");
var async = require("async");
const { ArgumentParser, argparser } = require('argparse');
const md5 = require('md5')

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


function parArg(api) {

  let parser = new ArgumentParser
  // let argparser = new ArgumentParser
  parser.addArgument('--api-key', { help: 'The API key to access the Zotero API.' })
  parser.addArgument('--config', { type: arg.file, help: 'Configuration file (toml format). Note that ./zotero-cli.toml and ~/.config/zotero-cli/zotero-cli.toml is picked up automatically.' })
  parser.addArgument('--user-id', { type: arg.integer, help: 'The id of the user library.' })
  parser.addArgument('--group-id', { type: arg.integer, help: 'The id of the group library.' })
  // See below. If changed, add: You can provide the group-id as zotero-select link (zotero://...). Only the group-id is used, the item/collection id is discarded.
  parser.addArgument('--indent', { type: arg.integer, help: 'Identation for json output.' })
  parser.addArgument('--out', { help: 'Output to file' })
  parser.addArgument('--verbose', { action: 'storeTrue', help: 'Log requests.' })

  const subparsers = parser.addSubparsers({ title: 'commands', dest: 'command', required: true })
  // add all methods that do not start with _ as a command
  for (const cmd of Object.getOwnPropertyNames(Object.getPrototypeOf(api)).sort()) {
    if (typeof api[cmd] !== 'function' || cmd[0] !== '$') continue

    const sp = subparsers.addParser(cmd.slice(1).replace(/_/g, '-'), { description: api[cmd].__doc__, help: api[cmd].__doc__ })
    // when called with an argparser, the command is expected to add relevant parameters and return
    // the command must have a docstring
    if (sp) {
      if (cmd === "$collection") {
        sp.addArgument('--key', { required: true, help: 'The key of the collection (required). You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
        sp.addArgument('--tags', { action: 'storeTrue', help: 'Display tags present in the collection.' })
        // argparser.addArgument('itemkeys', { nargs: '*' , help: 'Item keys for items to be added or removed from this collection.'})
        sp.addArgument('--add', { nargs: '*', help: 'Add items to this collection. Note that adding items to collections with \'item --addtocollection\' may require fewer API queries. (Convenience method: patch item->data->collections.)' })
        sp.addArgument('--remove', { nargs: '*', help: 'Convenience method: Remove items from this collection. Note that removing items from collections with \'item --removefromcollection\' may require fewer API queries. (Convenience method: patch item->data->collections.)' })
      }
      if (cmd === "$collections") {
        sp.addArgument('--top', { action: 'storeTrue', help: 'Show only collection at top level.' })
        sp.addArgument('--key', { help: 'Show all the child collections of collection with key. You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
        sp.addArgument('--create-child', { nargs: '*', help: 'Create child collections of key (or at the top level if no key is specified) with the names specified.' })
      }
      
    }
    else {
      api[cmd](sp)
    }
  }

  return parser
}




async function $key(argparser = null) {
/** Show details about this API key. (API: /keys ) */

  if (argparser) return

  this.show(await this.get(`/keys/${this.args.api_key}`, { userOrGroupPrefix: false }))
}

// Functions for get, post, put, patch, delete. (Delete query to API with uri.)

async function $get(argparser = null) {
  /** Make a direct query to the API using 'GET uri'. */
console.log("rrrrrrr")

 if (argparser) {                                                                                                                            
    argparser.addArgument('--root', { action: 'storeTrue', help: 'TODO: document' })
argparser.addArgument('uri', { nargs: '+', help: 'TODO: document' })
    return
}














  
    
  for (const uri of this.args.uri) {
    this.show(await this.get(uri, { userOrGroupPrefix: !this.args.root }))
  }
}

async function $post(argparser = null) {
  /** Make a direct query to the API using 'POST uri [--data data]'. */

  if (argparser) {
    argparser.addArgument('uri', { nargs: '1', help: 'TODO: document' })
    argparser.addArgument('--data', { required: true, help: 'Escaped JSON string for post data' })
    return
  }

  this.print(await this.post(this.args.uri, this.args.data))
}

async function $put(argparser = null) {
  /** Make a direct query to the API using 'PUT uri [--data data]'. */

  if (argparser) {
    argparser.addArgument('uri', { nargs: '1', help: 'TODO: document' })
    argparser.addArgument('--data', { required: true, help: 'Escaped JSON string for post data' })
    return
  }

  this.print(await this.put(this.args.uri, this.args.data))
};

async function $delete(argparser = null) {
  /** Make a direct delete query to the API using 'DELETE uri'. */

  if (argparser) {
    argparser.addArgument('uri', { nargs: '+', help: 'Request uri' })
    return
  }

  for (const uri of this.args.uri) {
    const response = await this.get(uri)
    await this.delete(uri, response.version)
  }
}
const ee = new Zotero()
ee.arg = arg
ee.parser = parArg(ee)
ee.args = parArg(ee).parseArgs()
ee.run(

    ).catch(err  => {
  console.error('error:', err)
  process.exit(1)
})
