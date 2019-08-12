# zotero-cli
## node


run 
```
npm install
```
run 
```
npm start -- <your args>
```
(e.g. `npm start -- tags --count`)

### for compiled JS:

```
npm run build
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

