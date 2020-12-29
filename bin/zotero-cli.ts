
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



async function $key(argparser = null) {
  /** Show details about this API key. (API: /keys ) */

  if (argparser) return

  this.show(await this.get(`/keys/${this.args.api_key}`, { userOrGroupPrefix: false }))
}

// Functions for get, post, put, patch, delete. (Delete query to API with uri.)

async function $get(argparser = null) {
  /** Make a direct query to the API using 'GET uri'. */

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


(new Zotero).run().catch(err => {
  console.error('error:', err)
  process.exit(1)
})
