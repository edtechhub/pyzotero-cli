# pyzotero-cli
Commandline interface for pyzotero

## Installation

On Linux you may already have python3. You may need to install pip3 

 sudo apt install python3-pip
 
Install requirements
 
 pip3 install -r requirements.txt

## Notes

- Uses https://json-schema.org/ to validate items for completion..
- Ini file format https://github.com/toml-lang/toml

## Disclaimer

WORK IN PROGRESS!

Also see https://github.com/urschrei/pyzotero/issues/92 and https://forums.zotero.org/discussion/76943/pyzotero-more-examples-and-command-line-interface#latest

## node

```
run `npm install`
run `npm start -- <your args>` (e.g. `npm start -- tags --count`)
```

for compiled JS:

```
npm run build
./bin/zotero-cli.js tags --count
```
