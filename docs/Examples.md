# Worked examples

Firstly, you need to have your login details ready. Otherwise you need to supply this with each call:

```
  --api-key API_KEY
  --config CONFIG
  --user-id USER_ID *or* --group-id GROUP_ID
  --indent INDENT
```

Once this is set up, e.g. show your collections

```
zotero-cli collections --help
zotero-cli collections
```

Show sub-collections of a collection

```
zotero-cli collections --key K35DEJSM
```

Note down a key (K35DEJSM). Show some items

```
zotero-cli items --help
zotero-cli items --top
zotero-cli items --collection K35DEJSM
```

Show the groups user is part of

```
zotero-cli groups
```

Update an existing item:
Properties not included in the uploaded JSON are left untouched on the server.

```
zotero-cli update-item --key ITEM_KEY UPDATE.json
```

Add or remove item from several collections

```
zotero-cli item --key ABC --addtocollection=DEF --removefromcollection=GHI,JKL
```

With --replace, you submit the item's complete editable JSON to the server, typically by modifying the downloaded editable JSON — that is, the contents of the data property — directly and resubmitting it.

```
zotero-cli update-item --key ITEM_KEY NEW.json
```

# Item types and item fields (with localised names) 

```
zotero-cli types
zotero-cli fields --type=book
```

# Item creation
Here is how you use create-item:
```
zotero-cli create-item --template book > book.json
gedit book.json
zotero-cli create-item book.json
```
For further options, see `zotero-cli create-item --h`.

# Generic get request
```
zotero-cli get /apipath
```

# Getting attachments
```
zotero-cli.ts attachment [-h] --key KEY --save SAVE
```
