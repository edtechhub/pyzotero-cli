#!/usr/bin/env node
import { parse } from '@iarna/toml';
import * as argparse from 'argparse';

var Zotero = require('../zotero-lib/bin/zotero-api-lib');


function getArguments() {

  const parser = new argparse.ArgumentParser({ "description": "Zotero command line utility" });
  parser.addArgument('--api-key', { help: 'The API key to access the Zotero API.' })
  parser.addArgument('--config', { type: argparse.file, help: 'Configuration file (toml format). Note that ./zotero-cli.toml and ~/.config/zotero-cli/zotero-cli.toml is picked up automatically.' })
  parser.addArgument('--user-id', { type: argparse.integer, help: 'The id of the user library.' })
  parser.addArgument('--group-id', { type: argparse.integer, help: 'The id of the group library.' })
  // See below. If changed, add: You can provide the group-id as zotero-select link (zotero://...). Only the group-id is used, the item/collection id is discarded.
  parser.addArgument('--indent', { type: argparse.integer, help: 'Identation for json output.' })
  parser.addArgument('--out', { help: 'Output to file' })
  parser.addArgument('--verbose', { action: 'storeTrue', help: 'Log requests.' })

  //async $collections

  parser.addArgument('--top', { action: 'storeTrue', help: 'Show only collection at top level.' })
  //parser.addArgument('--key', { action:'',help: 'Show all the child collections of collection with key. You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
  parser.addArgument('--create-child', { nargs: '*', help: 'Create child collections of key (or at the top level if no key is specified) with the names specified.' })

  //async $collection


  //parser.addArgument('--key', { required: true, help: 'The key of the collection (required). You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
  parser.addArgument('--tags', { action: 'storeTrue', help: 'Display tags present in the collection.' })
  // argparser.addArgument('itemkeys', { nargs: '*' , help: 'Item keys for items to be added or removed from this collection.'})
  parser.addArgument('--add', { nargs: '*', help: 'Add items to this collection. Note that adding items to collections with \'item --addtocollection\' may require fewer API queries. (Convenience method: patch item->data->collections.)' })
  parser.addArgument('--remove', { nargs: '*', help: 'Convenience method: Remove items from this collection. Note that removing items from collections with \'item --removefromcollection\' may require fewer API queries. (Convenience method: patch item->data->collections.)' })


  //async items

  parser.addArgument('--count', { action: 'storeTrue', help: 'Return the number of items.' })
  // argparser.addArgument('--all', { action: 'storeTrue', help: 'obsolete' })
  //parser.addArgument('--filter', { type: argparse.json, help: 'Provide a filter as described in the Zotero API documentation under read requests / parameters. For example: \'{"format": "json,bib", "limit": 100, "start": 100}\'.' })
  parser.addArgument('--collection', { help: 'Retrive list of items for collection. You can provide the collection key as a zotero-select link (zotero://...) to also set the group-id.' })
  //parser.addArgument('--top', { action: 'storeTrue', help: 'Retrieve top-level items in the library/collection (excluding child items / attachments, excluding trashed items).' })
  parser.addArgument('--validate', { type: argparse.path, help: 'json-schema file for all itemtypes, or directory with schema files, one per itemtype.' })

  //async item

  //parser.addArgument('--key', { required: true, help: 'The key of the item. You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
  parser.addArgument('--children', { action: 'storeTrue', help: 'Retrieve list of children for the item.' })
  //parser.addArgument('--filter', { type: argparse.json, help: 'Provide a filter as described in the Zotero API documentation under read requests / parameters. To retrieve multiple items you have use "itemkey"; for example: \'{"format": "json,bib", "itemkey": "A,B,C"}\'. See https://www.zotero.org/support/dev/web_api/v3/basics#search_syntax.' })
  parser.addArgument('--addfile', { nargs: '*', help: 'Upload attachments to the item. (/items/new)' })
  parser.addArgument('--savefiles', { nargs: '*', help: 'Download all attachments from the item (/items/KEY/file).' })
  parser.addArgument('--addtocollection', { nargs: '*', help: 'Add item to collections. (Convenience method: patch item->data->collections.)' })
  parser.addArgument('--removefromcollection', { nargs: '*', help: 'Remove item from collections. (Convenience method: patch item->data->collections.)' })
  parser.addArgument('--addtags', { nargs: '*', help: 'Add tags to item. (Convenience method: patch item->data->tags.)' })
  parser.addArgument('--removetags', { nargs: '*', help: 'Remove tags from item. (Convenience method: patch item->data->tags.)' })

  //async attachement

  parser.addArgument('--key', { required: true, help: 'The key of the item. You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
  parser.addArgument('--save', { required: true, help: 'Filename to save attachment to.' })
  
  //async create item

  parser.addArgument('--template', { help: "Retrieve a template for the item you wish to create. You can retrieve the template types using the main argument 'types'." })
  parser.addArgument('items', { nargs: '*', help: 'Json files for the items to be created.' })

  //update item


  //parser.addArgument('--key', { required: true, help: 'The key of the item. You can provide the key as zotero-select link (zotero://...) to also set the group-id.' })
  parser.addArgument('--replace', { action: 'storeTrue', help: 'Replace the item by sumbitting the complete json.' })
  parser.addArgument('items', { nargs: 1, help: 'Path of item files in json format.' })


  //async get

  parser.addArgument('--root', { action: 'storeTrue', help: 'TODO: document' })
  parser.addArgument('uri', { nargs: '+', help: 'TODO: document' })

  //async post

  parser.addArgument('uri', { nargs: '1', help: 'TODO: document' })
  parser.addArgument('--data', { required: true, help: 'Escaped JSON string for post data' })


  //async put

  parser.addArgument('uri', { nargs: '1', help: 'TODO: document' })
  //parser.addArgument('--data', { required: true, help: 'Escaped JSON string for post data' })

  //async delete

  parser.addArgument('uri', { nargs: '+', help: 'Request uri' })
  
  
  //fields
  parser.addArgument('--type', { help: 'Display fields types for TYPE.' })


  //searches
  
  parser.addArgument('--create', { nargs: 1, help: 'Path of JSON file containing the definitions of saved searches.' })

  //tags
  parser.addArgument('--filter', { help: 'Tags of all types matching a specific name.' })
  //parser.addArgument('--count', { action: 'storeTrue', help: 'TODO: document' })


  

  const subparsers = parser.addSubparsers({ title: 'commands', dest: 'command', required: true })
  // add all methods that do not start with _ as a command
  for (const cmd of Object.getOwnPropertyNames(Object.getPrototypeOf(parser)).sort()) {
    if (typeof parser[cmd] !== 'function' || cmd[0] !== '$') continue

    const sp = subparsers.addParser(cmd.slice(1).replace(/_/g, '-'), { description: parser[cmd].__doc__, help: parser[cmd].__doc__ })
    // when called with an argparser, the command is expected to add relevant parameters and return
    // the command must have a docstring
    parser[cmd](sp)

}


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