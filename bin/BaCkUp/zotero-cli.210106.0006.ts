#!/usr/bin/env node

import { parse } from '@iarna/toml';
import * as argparse from 'argparse';

var Zotero = require('../zotero-lib/bin/zotero-api-lib');


function getArguments() {

  const parser = new argparse.ArgumentParser({ "description": "Zotero command line utility" });
  parser.addArgument(
    '--api-key', { help: 'The API key to access the Zotero API.' })
  parser.addArgument(
    '--config', { type: argparse.file, help: 'Configuration file (toml format). Note that ./zotero-cli.toml and ~/.config/zotero-cli/zotero-cli.toml is picked up automatically.' })
  parser.addArgument(
    '--user-id', { type: argparse.integer, help: 'The id of the user library.' })
  parser.addArgument('--group-id', {
     action: 'store',
    type: argparse.integer,
    help: 'The id of the group library.' })
  // See below. If changed, add: You can provide the group-id as zotero-select link (zotero://...). Only the group-id is used, the item/collection id is discarded.
  parser.addArgument(
    '--indent', { type: argparse.integer, help: 'Identation for json output.' })
  parser.addArgument(
    '--out', { help: 'Output to file' })
  parser.addArgument(
    '--verbose', { action: 'storeTrue', help: 'Log requests.' })

/*
The following code explcitly adds subparsers. 
Previously these were defined by the functions themselves (see below).
*/

  //async $collections
  const subparsers = parser.add_subparsers({ "help": "sub-command help" });
  const parser_collections = subparsers.add_parser("collections", { "help": "Collections command" });
  parser_collections.addArgument('--top', { action: 'storeTrue', help: 'Show only collection at top level.' })
  parser_collections.addArgument('--key', { nargs: 1, required: true, help: 'Show all the child collections of collection with key. You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
  parser_collections.addArgument('--create-child', { nargs: '*', help: 'Create child collections of key (or at the top level if no key is specified) with the names specified.' })

  //async $collection
  const parser_collection = subparsers.add_parser("collection", { "help": "Collection command" });
  parser_collection.addArgument('--key', { nargs: 1, help: 'The key of the collection (required). You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
  parser_collection.addArgument('--tags', { action: 'storeTrue', help: 'Display tags present in the collection.' })
  parser_collection.addArgument('itemkeys', { nargs: '*' , help: 'Item keys for items to be added or removed from this collection.'})
  parser_collection.addArgument('--add', { nargs: '*', help: 'Add items to this collection. Note that adding items to collections with \'item --addtocollection\' may require fewer API queries. (Convenience method: patch item->data->collections.)' })
  parser_collection.addArgument('--remove', { nargs: '*', help: 'Convenience method: Remove items from this collection. Note that removing items from collections with \'item --removefromcollection\' may require fewer API queries. (Convenience method: patch item->data->collections.)' })


  //async items
  const parser_items = subparsers.add_parser("items", { "help": "Items command" });
  parser_items.addArgument('--count', { action: 'storeTrue', help: 'Return the number of items.' })
  // argparser.addArgument('--all', { action: 'storeTrue', help: 'obsolete' })
  parser_items.addArgument('--filter', { type: argparse.json, help: 'Provide a filter as described in the Zotero API documentation under read requests / parameters. For example: \'{"format": "json,bib", "limit": 100, "start": 100}\'.' })
  parser_items.addArgument('--collection', { help: 'Retrive list of items for collection. You can provide the collection key as a zotero-select link (zotero://...) to also set the group-id.' })
  parser_items.addArgument('--top', { action: 'storeTrue', help: 'Retrieve top-level items in the library/collection (excluding child items / attachments, excluding trashed items).' })
  parser_items.addArgument('--validate', { type: argparse.path, help: 'json-schema file for all itemtypes, or directory with schema files, one per itemtype.' })

  //async item
  const parser_item = subparsers.add_parser("item", { "help": "Item command" });
  parser_item.addArgument(
    '--key', { "action": "store",
	       "required": true,
	       "help": 'The key of the item. You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
  parser_item.addArgument(
    '--children', { action: 'storeTrue', help: 'Retrieve list of children for the item.' })
  parser_item.addArgument(
    '--filter', {
      type: argparse.json,
      help: 'Provide a filter as described in the Zotero API documentation under read requests / parameters. To retrieve multiple items you have use "itemkey"; for example: \'{"format": "json,bib", "itemkey": "A,B,C"}\'. See https://www.zotero.org/support/dev/web_api/v3/basics#search_syntax.' })
  parser_item.addArgument('--addfile', { nargs: '*', help: 'Upload attachments to the item. (/items/new)' })
  parser_item.addArgument('--savefiles', { nargs: '*', help: 'Download all attachments from the item (/items/KEY/file).' })
  parser_item.addArgument('--addtocollection', { nargs: '*', help: 'Add item to collections. (Convenience method: patch item->data->collections.)' })
  parser_item.addArgument('--removefromcollection', { nargs: '*', help: 'Remove item from collections. (Convenience method: patch item->data->collections.)' })
  parser_item.addArgument('--addtags', { nargs: '*', help: 'Add tags to item. (Convenience method: patch item->data->tags.)' })
  parser_item.addArgument('--removetags', { nargs: '*', help: 'Remove tags from item. (Convenience method: patch item->data->tags.)' })

  //async attachement
  const parser_attachment = subparsers.add_parser("attachment", { "help": "Item command" });
  parser_attachment.addArgument('--key', { "action": "store", required: true, help: 'The key of the item. You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
  parser_attachment.addArgument('--save', { "action": "store", required: true, help: 'Filename to save attachment to.' })
  
  //async create item
  const parser_create = subparsers.add_parser("create", { "help": "Create command" });
  parser_create.addArgument('--template', { help: "Retrieve a template for the item you wish to create. You can retrieve the template types using the main argument 'types'." })
  parser_create.addArgument('items', { nargs: '*', help: 'Json files for the items to be created.' })

  //update item
  const parser_update = subparsers.add_parser("update", { "help": "update command" });
  parser_update.addArgument('--key', { required: true, help: 'The key of the item. You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
  parser_update.addArgument('--replace', { action: 'storeTrue', help: 'Replace the item by sumbitting the complete json.' })
  parser_update.addArgument('items', { nargs: 1, help: 'Path of item files in json format.' })

  //async get
  const parser_get = subparsers.add_parser("get", { "help": "get command" });
  parser.addArgument('--root', { action: 'storeTrue', help: 'TODO: document' })
  parser.addArgument('uri', { nargs: '+', help: 'TODO: document' })

  //async post
  const parser_post = subparsers.add_parser("post", { "help": "post command" });
  parser_post.addArgument('uri', { action: "store", nargs: 1, help: 'TODO: document' })
  parser_post.addArgument('--data', { required: true, help: 'Escaped JSON string for post data' })

  //async put
  const parser_put = subparsers.add_parser("put", { "help": "put command" });
  parser_put.addArgument('uri', { action: "store", nargs: 1, help: 'TODO: document' })
  parser_put.addArgument('--data', { required: true, help: 'Escaped JSON string for post data' })

  //async delete
  const parser_delete = subparsers.add_parser("delete", { "help": "delete command" });
  parser_delete.addArgument('uri', { nargs: '+', help: 'Request uri' })
  
  //fields
  const parser_fields = subparsers.add_parser("fields", { "help": "fields command" });
  parser_fields.addArgument('--type', { help: 'Display fields types for TYPE.' })

  //searches
  const parser_searches = subparsers.add_parser("searches", { "help": "searches command" });  
  parser_searches.addArgument('--create', { nargs: 1, help: 'Path of JSON file containing the definitions of saved searches.' })

  //tags
  const parser_tags = subparsers.add_parser("tags", { "help": "tags command" });
  parser_tags.addArgument('--filter', { help: 'Tags of all types matching a specific name.' })
  parser_tags.addArgument('--count', { action: 'storeTrue', help: 'TODO: document' })

  // TODO: reinstate key
  /*
  async function $key(argparse) {
    //** 
    this.show(await this.get(`/keys/${this.args.api_key}`, { userOrGroupPrefix: false }))
  }
  */

  /*

  This was the previous method of getting sub-parsers.

  It extracts the sub-parser functions from each function. This is a
  smart way of defining the interface.

   */
  /*
  const subparsers = parser.addSubparsers({ title: 'commands', dest: 'command', required: true })
  // add all methods that do not start with _ as a command
  for (const cmd of Object.getOwnPropertyNames(Object.getPrototypeOf(parser)).sort()) {
    if (typeof parser[cmd] !== 'function' || cmd[0] !== '$') continue
    const sp = subparsers.addParser(cmd.slice(1).replace(/_/g, '-'), { description: parser[cmd].__doc__, help: parser[cmd].__doc__ })
    // when called with an argparser, the command is expected to add relevant parameters and return
    // the command must have a docstring
    parser[cmd](sp)
  } */

  // Other URLs
  // https://www.zotero.org/support/dev/web_api/v3/basics
  // /keys/<key>	
  // /users/<userID>/groups	
  /*
  async function $key(argparse) {
    /** Show details about this API key. (API: /keys ) */
/*
    this.show(await this.get(`/keys/${this.args.api_key}`, { userOrGroupPrefix: false }))
  }*/


  // Functions for get, post, put, patch, delete. (Delete query to API with uri.)
  
  /*
  async function $get(argparser = null) {
    /** Make a direct query to the API using 'GET uri'. */
/*
    if (argparser) {
      argparser.addArgument('--root', { action: 'storeTrue', help: 'TODO: document' })
      argparser.addArgument('uri', { nargs: '+', help: 'TODO: document' })
      return
    }

    for (const uri of this.args.uri) {
      this.show(await this.get(uri, { userOrGroupPrefix: !this.args.root }))
    }
  }
*/
  

/*

  async function $post(argparser = null) {
    /** Make a direct query to the API using 'POST uri [--data data]'. */
/*
    if (argparser) {
      argparser.addArgument('uri', { nargs: '1', help: 'TODO: document' })
      argparser.addArgument('--data', { required: true, help: 'Escaped JSON string for post data' })
      return
    }

    this.print(await this.post(this.args.uri, this.args.data))
  }
*/


/*
  async function $put(argparser = null) {
    /** Make a direct query to the API using 'PUT uri [--data data]'. */
   /*
    if (argparser) {
      argparser.addArgument('uri', { nargs: '1', help: 'TODO: document' })
      argparser.addArgument('--data', { required: true, help: 'Escaped JSON string for post data' })
      return
    }

    this.print(await this.put(this.args.uri, this.args.data))
  }

  */


  /*

  async function $delete(argparser = null) {
    /** Make a direct delete query to the API using 'DELETE uri'. */
/*
    if (argparser) {
      argparser.addArgument('uri', { nargs: '+', help: 'Request uri' })
      return
    }

    for (const uri of this.args.uri) {
      const response = await this.get(uri)
      await this.delete(uri, response.version)
    }
  }

  */


 //parser.set_defaults({ "func": new Zotero().run() });
 //this.parser.parse_args();

 return parser.parseArgs();
 
}


// --- main ---
var args = getArguments()

/*
if (args.verbose) {
  console.log("zotero-cli starting...")
}
// zenodo-cli create --title "..." --authors "..." --dryrun
if (args.dryrun) {
  console.log(`API command:\n Zotero.${args.func.name}(${JSON.stringify(args, null, 2)})`);
} else {
  // ZenodoAPI.${args.func.name}(args)
  args.func(args);
}
*/



//console.log(`Here...${zoterolib.Zotero}`);

var test = new Zotero(args);
test.func(args).catch(err => {
  console.error('error:', err)
  process.exit(1)
});

/*
(zoterolib.zotero.run().catch(err => {
  console.error('error:', err)
  process.exit(1)
})
)
*/

module.exports = {
  node: 'current'
};
