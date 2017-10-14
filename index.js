const config = require('config')
const express = require('express')
const log = require('./log')
const api = require('./api')
const server = express()

server.use('/api', api)

server.use((req, res) => {
  res.status(404).send()
})

server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  log.error(err)
  res.status(500).send()
})

server.listen(config.get('server.port'), () => {
  log.info(`lcd-pcf8574-server is now listening on port ${config.get('server.port')} (NODE_ENV=${process.env.NODE_ENV})`)
})
