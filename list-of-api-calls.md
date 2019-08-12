Implementation of API methods
For pyzotero-cli, these should be implemented so that they always return all items, i.e. they should take care of paging.
The text from this doc was copied from pyzotero. It should be used to document options in pyzotero-cli

## Zotero.key_info()

* Returns info about the user and group library permissions associated with the current Zotero instance, based on the API key. Together with Zotero.groups(), this allows all accessible resources to be determined.
* status: implemented

## Zotero.items([search/request parameters])    

* Returns Zotero library items
* status: implemented

## Zotero.count_items()

* Returns a count of all items in a library / group
* status: implemented


## Zotero.top([search/request parameters])

* Returns top-level Zotero library items
* status: implemented

## Zotero.publications()

* Returns the publications from the “My Publications” collection of a user’s library. Only available on user libraries.
* status: implemented

## Zotero.trash([search/request parameters])

* Returns library items from the library’s trash
* status: implemented

## Zotero.deleted([search/request parameters])    

* Returns deleted collections, library items, tags, searches and settings (requires “since=” parameter)
* status: PLEASE IMPLEMENT

## Zotero.item(itemID[, search/request parameters])

* Returns a specific item
* status: implemented

I don't know what the combination of itemID and search/request parameters is supposed to accomplish. If you already have the itemID, what do you want to search for?

## Zotero.children(itemID[, search/request parameters])

* Returns the child items of a specific item
* status: implemented

## Zotero.collection_items(collectionID[, search/request parameters])

* Returns items from the specified collection. This includes sub-collection items
* status: implemented

## Zotero.collection_items_top(collectionID[, search/request parameters])

* Returns top-level items from the specified collection.
* status: implemented

## Zotero.get_subset(itemIDs[, search/request parameters])

* Retrieve an arbitrary set of non-adjacent items. Limited to 50 items per call.
* status: PLEASE IMPLEMENT

I don't know what this means

## Zotero.file(itemID[, search/request parameters])

* Returns the raw file content of an item
##  Question: What happens if there is more than one file attachment?

## Zotero.dump(itemID[, filename, path])
##  A convenient wrapper around Zotero.file(). Writes an attachment to
##  disk using the optional path and filename. If neither are supplied,
##  the file is written to the current working directory, and a
##  Zotero.item() call is first made to determine the attachment
##  filename. No error checking is done regarding the path. If
##  successful, the full path including the file name is returned.

## Zotero.collections([search/request parameters])

* Returns a library’s collections. This includes subcollections.
* status: implemented

## Zotero.collections_top([search/request parameters])

* Returns a library’s top-level collections.
* status: implemented

## Zotero.collection(collectionID[, search/request parameters])

* Returns a specific collection
* status: PLEASE IMPLEMENT

## Zotero.collections_sub(collectionID[, search/request parameters])

* Returns the sub-collections of a specific collection
* status: PLEASE IMPLEMENT

## Zotero.all_collections([collectionID])
##   Returns either all collections and sub-collections in a flat list, or,
##   if a collection ID is specified, that collection and all of its
##   sub-collections. This method can be called at any collection “depth”.
* status: PLEASE IMPLEMENT

## Zotero.groups([search/request parameters])
##   Retrieve the Zotero group data to which the current library_id and api_key has access
* status: PLEASE IMPLEMENT

## Zotero.tags([search/request parameters])

* Returns a library’s tags
* status: IMPLEMENTED, not working as expected.
    
## Zotero.item_tags(itemID[, search/request parameters])

* Returns tags from a specific item
* status: PLEASE IMPLEMENT

## Zotero.item_versions([search/request parameters])

* Returns a dict containing version information for items in the library

## Zotero.collection_versions(itemID[, search/request parameters])

* Returns a dict containing version information for collections in the library

## Zotero.new_fulltext(since)

* Returns a dict containing item keys and library versions newer than since (a library version string, e.g. "1085")

## Zotero.fulltext_item(itemID[, search/request parameters])
##   Returns a dict containing full-text data for the given attachment
##   item. indexedChars and totalChars are used for text documents,
##   while indexedPages and totalPages are used for PDFs.

## Zotero.set_fulltext(itemID, payload)
##  Set full-text data for an item

## Zotero.num_items()     

* Returns the count of top-level items in the library
* status: PLEASE IMPLEMENT

def zotero_num_items(zot, **filter):
    if filter:
        print("--filter has no effect for this action.")
    items = zot.num_items()
    print(json.dumps(items, indent=jsonIndent))

## Zotero.num_collectionitems(collectionID)

* Returns the count of items in the specified collection
* status: PLEASE IMPLEMENT

## Zotero.num_tagitems(tag)

* Returns the count of items for the specified tag
* status: PLEASE IMPLEMENT - however, see bug report. Not sure this works in the API.

## Zotero.last_modified_version()
##    If you wish to retrieve the last modified version of a library, you
##   can use the following method: Returns the last modified version of
##   the library
* status: PLEASE IMPLEMENT


## Zotero.searches()
##  Retrieve all saved searches. Note that this retrieves saved search metadata, as opposed to content; saved searches cannot currently (January 2019) be run using the API.
* status: implemented.

## Zotero.saved_search(name, conditions)
##  Create a new saved search. conditions is a list of one or more dicts,
##  each of which must contain the following three string keys: condition,
##  operator, value. See the documentation for an example.
* status: PLEASE IMPLEMENT

def zotero_saved_search(zot, **filter):
    if filter:
        print("--filter has no effect for this action.")
    if args.files is None:
        print("No positional arguments.")
        exit()
    for file in arg.files:
        print("Search file: " + file)
        with open(file) as json_file:  
            searchdefs = json.load(json_file)
            for mydef in searchdefs:
                print("   Adding: "+ mydef['name']);
                result = zot.saved_search(mydef['name'], mydef['conditions'])
                print(json.dumps(result))
    print("Done")

## Zotero.delete_saved_search(search_keys)
##  Delete one or more saved searches. search_keys is a list of one or
##  more search keys. These can be retrievd using Zotero.searches()

## Zotero.show_operators()
##  Show available saved search operators
* status: PLEASE IMPLEMENT

## Zotero.show_conditions()
##  Show available saved search conditions
* status: PLEASE IMPLEMENT

## Zotero.show_condition_operators(condition)
##  Show available operators for a given saved search condition
* status: PLEASE IMPLEMENT

## Zotero.item_types()

* Returns a dict containing all available item types
* status: PLEASE IMPLEMENT

## Zotero.item_fields()

* Returns a dict of all available item fields
* status: PLEASE IMPLEMENT

## Zotero.item_creator_types(itemtype)

* Returns a dict of all valid creator types for the specified item type
* status: PLEASE IMPLEMENT

## Zotero.creator_fields()

* Returns a dict containing all localised creator fields
* status: PLEASE IMPLEMENT

## Zotero.item_type_fields(itemtype)

* Returns all valid fields for the specified item type
* status: PLEASE IMPLEMENT

## Zotero.item_template(itemtype)

* Returns an item creation template for the specified item type
* status: PLEASE IMPLEMENT

## Zotero.create_items(items[, parentid, last_modified])
##  Create Zotero library items
* status: PLEASE IMPLEMENT
##  Important: Needs to check whether the creation was successful.

## Zotero.update_item(item[, last_modified])
##  Update an item in your library
* status: PLEASE IMPLEMENT
##  Important: Needs to check whether the creation was successful.

## Zotero.update_items(items)
##  Update items in your library. The API only accepts 50 items per
##  call, so longer updates are chunked

## Zotero.check_items(items)
##  Check whether items to be created on the server contain only valid keys. 
##  This method first creates a set of valid keys by calling item_fields(), 
##  then compares the user-created dicts to it. If any keys in the user-created dicts are unknown, 
##  a InvalidItemFields exception is raised, detailing the invalid fields.
* status: PLEASE IMPLEMENT

## Zotero.attachment_simple(files[, parentid])
##  Create one or more file attachment items. (Attachment methods are in beta.)
* status: PLEASE IMPLEMENT

## Zotero.attachment_both(files[, parentid])
##  Create one or more file attachment items, specifying names for uploaded files
##  (Attachment methods are in beta.)
* status: PLEASE IMPLEMENT

## Zotero.upload_attachments(attachments[, parentid, basedir=None])
## Upload files to their corresponding attachments. If the attachments
## lack the key property they are assumed not to exist and will be
## created. The parentid parameter is not compatible with existing
## attachments. In order for uploads to succeed, the filename parameter
## of each attachment must resolve.  (Attachment methods are in beta.)
* status: PLEASE IMPLEMENT

## Zotero.delete_item(item[, last_modified])
## Delete one or more items from your library

## Zotero.delete_tags(tag_a[, tag …])
## Delete one or more tags from your library
* status: PLEASE IMPLEMENT

## Zotero.add_tags(item, tag[, tag …])
## Add one or more tags to an item, and update it on the server
* status: PLEASE IMPLEMENT

## Zotero.create_collections(dicts[, last_modified])
## Create a new collection in the Zotero library
* status: PLEASE IMPLEMENT

## Zotero.create_collections(dicts[, last_modified])
## Alias for create_collections to preserve backward compatibility
## This seems to be a duplicate of the above item. Have raise issue in pyzotero.

## Zotero.addto_collection(collection, item)
## Add the specified item(s) to the specified collection
* status: PLEASE IMPLEMENT

## Zotero.deletefrom_collection(collection, item)
## Zotero.deletefrom_collection(collection, item)
* status: PLEASE IMPLEMENT

## Zotero.update_collection(collection , last_modified])
## Update existing collection metadata (name etc.)

## Zotero.update_collections(collection_items)
## Update multiple existing collection metadata. The API only accepts 50 collections per call, so longer updates are chunked

## Zotero.collection_tags(collectionID[, search/request parameters])
## Retrieve all tags for a given collection
* status: PLEASE IMPLEMENT

## Zotero.delete_collection(collection[, last_modified])
## Delete a collection from the Zotero library


### General item methods - nothing to implement here, just for reference.
## Zotero.follow()
## Zotero.everything()
## Zotero.iterfollow()
## Zotero.makeiter(API call)

## Examples    - keeping these here so we can check lateron what's still needed

def get_all_items_with_tag(zot, tag=None):
    if filter:
        print("--filter has no effect for this action.")
    items = zot.everything(zot.items(tag=tag))
    for item in items:
        print(json.dumps(item, indent=jsonIndent))

def get_attachment_or_note(zot):
    if filter:
        print("--filter has no effect for this action.")
    items = zot.everything(zot.items(itemType=["-attachment","-note"]))
    print(json.dumps(items, indent=jsonIndent))

## Note - this doesn't seem to work!
## https://github.com/urschrei/pyzotero/issues/93
def count_items_with_tag(zot, **filter):    
    if filter:
        items = zot.everything(zot.tags(filter))
    else:
        items = zot.everything(zot.tags())
    # print(json.dumps(items, indent=jsonIndent))
    for tag in items:
        items = zot.num_tagitems(tag)
        print(tag + " " + items)
    
