
  // Other URLs
  // https://www.zotero.org/support/dev/web_api/v3/basics
  // /keys/<key>	
  // /users/<userID>/groups	
  
  async $key(argparser = null) {
    /** Show details about this API key. (API: /keys ) */

    if (argparser) return

    this.show(await this.get(`/keys/${this.args.api_key}`, { userOrGroupPrefix: false }))
  }

  // Functions for get, post, put, patch, delete. (Delete query to API with uri.)
  
  async $get(argparser = null) {
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

  async $post(argparser = null) {
    /** Make a direct query to the API using 'POST uri [--data data]'. */

    if (argparser) {
      argparser.addArgument('uri', { nargs: '1', help: 'TODO: document' })
      argparser.addArgument('--data', { required: true, help: 'Escaped JSON string for post data' })
      return
    }

    this.print(await this.post(this.args.uri, this.args.data))
  }

  async $put(argparser = null) {
    /** Make a direct query to the API using 'PUT uri [--data data]'. */

    if (argparser) {
      argparser.addArgument('uri', { nargs: '1', help: 'TODO: document' })
      argparser.addArgument('--data', { required: true, help: 'Escaped JSON string for post data' })
      return
    }

    this.print(await this.put(this.args.uri, this.args.data))
  }

  async $delete(argparser = null) {
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
}

(new Zotero).run().catch(err => {
  console.error('error:', err)
  process.exit(1)
})
