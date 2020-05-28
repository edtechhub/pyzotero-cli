# Worked examples

## Getting started

Firstly, you need to have your login details ready. Otherwise you need to supply this with each call:

```
  --api-key API_KEY
  --config CONFIG
  --user-id USER_ID *or* --group-id GROUP_ID
  --indent INDENT
```

Remember that you can store this in `zotero-cli.toml` too.

## What groups do I have access to?

If you want to access a group collection but don't know the GROUP_ID, find it like this:

```
zotero-cli.js groups
```

# Collections

## Display collections

Once the login details are set up, and you have the GROUP_ID, e.g. show your collections

```
zotero-cli.js collections --help
zotero-cli.js collections
```

Note down a key (K35DEJSM). Show sub-collections of that collection

```
zotero-cli.js collections --key K35DEJSM
```

## Adding and removing items to/from a collection

```
zotero-cli.js collection --key K35DEJSM --add ITEM_KEY1 ITEM_KEY2 --remove ITEM_KEY3 ITEM_KEY4
```

## Adding sub-collections

```
zotero-cli.js collections --key K35DEJSM --create-child "Child subcollection1" "Child subcollection 2"
```

## Adding collections at the top level

```
zotero-cli.js collections --create-child "Child subcollection1" "Child subcollection 2"
```

# Items

## Getting item information

Use the same key (K35DEJSM). Show some items

```
zotero-cli.js items --help
zotero-cli.js items --top
zotero-cli.js items --collection K35DEJSM
```

## Item types and item fields (with localised names)

```
zotero-cli.js types
zotero-cli.js fields --type=book
```

## Updating the collections for an item

Add or remove item from several collections

```
zotero-cli.js item --key ABC --addtocollection=DEF --removefromcollection=GHI,JKL
```

## Update an existing item:

Properties not included in the uploaded JSON are left untouched on the server.

```
zotero-cli.js update-item --key ITEM_KEY UPDATE.json
```

With --replace, you submit the item's complete editable JSON to the server, typically by modifying the downloaded editable JSON — that is, the contents of the data property — directly and resubmitting it.

```
zotero-cli.js update-item --key ITEM_KEY NEW.json
```

## Item creation

Here is how you use create-item:

```
zotero-cli.js create-item --template book > book.json
gedit book.json
zotero-cli.js create-item book.json
```

For further options, see `zotero-cli.js create-item --h`.

# Attachments

## Getting attachments

```
zotero-cli.js attachment [-h] --key KEY --save SAVE
```

# Searches

## Get searches

```
zotero-cli.js searches
```

## Create new saved search(s)

Get the json for existing searches, edit, and create.

```
zotero-cli.js searches > search.json
gedit search.json
zotero-cli.js searches --create search.json
```

# Generic get request

```
zotero-cli.js get /apipath
```
