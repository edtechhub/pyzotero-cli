# zotero-cli
## node

Run the following command to install dependencies 
```
npm install
```
Then run to run the script: 
```
npm start -- <your args>
```
E.g. 
```
npm start -- tags --count
```

### For compiled JS:

```
npm i @types/node
npm run build
```
Then:
```
./bin/zotero-cli.js <your args>
```
E.g. 
```
./bin/zotero-cli.js tags --count
```

## Documentation

### Configuration

Get help with 
```
zotero-cli -h
```
Optional arguments:
```
  -h, --help            Show this help message and exit.
  --api-key API_KEY
  --config CONFIG
  --user-id USER_ID
  --group-id GROUP_ID
  --indent INDENT
```
You can create a config.toml file as follows
```
api-key = "..."
group-id = 123
library-type = "group"
indent = 4
```
A file called zotero-cli.toml is picked up automatically.

### Commands
Get help with 
```
zotero-cli -h
```
which returns a set of commands, such as key,collection,collections,items,item,publications,trash,tags,searches,attachment,types,fields. You can get help on any of these with 
```
zotero-cli <command> --help
```
e.g.
```
zotero-cli collection --help
```
### Worked examples.
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
Note down a key (K35DEJSM). Show some items
 ```
 zotero-cli items --help
 zotero-cli items --top
 zotero-cli items --collection K35DEJSM
 ```
 
 
