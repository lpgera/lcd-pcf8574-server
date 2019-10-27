import config from 'config'
import express from 'express'
import log from './log'
import api from './api'

const server = express()

server.use('/api', api)

server.use((_, res) => {
  res.status(404).send()
})

// @ts-ignore
// noinspection JSUnusedLocalSymbols
server.use((err, req, res, next) => {
  log.error(err)
  res.status(500).send()
})

server.listen(config.get('server.port'), () => {
  log.info(
    `lcd-pcf8574-server is now listening on port ${config.get(
      'server.port'
    )} (NODE_ENV=${process.env.NODE_ENV})`
  )
})
