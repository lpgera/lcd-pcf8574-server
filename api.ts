import express from 'express'
import expressBasicAuth from 'express-basic-auth'
import bodyParser from 'body-parser'
import expressJsonschema from 'express-jsonschema'
import config from 'config'
import * as display from './display'
import logger from './log'

const log = logger.child({ module: 'api' })
const router = express.Router()

router.use(bodyParser.json())

router.use(
  expressBasicAuth({
    users: config.get('server.users'),
  })
)

router.use((req, _, next) => {
  log.debug('api call received:', req.method, req.originalUrl, req.body)
  return next()
})

const powerSchema = {
  type: 'object',
  properties: {
    state: {
      type: 'string',
      required: true,
      enum: ['on', 'off'],
    },
  },
}

router.put(
  '/power',
  // @ts-ignore
  expressJsonschema.validate({ body: powerSchema }),
  (req, res) => {
    if (req.body.state === 'on') {
      display.on()
    } else {
      display.off()
    }
    return res.status(204).send()
  }
)

const configurationSchema = {
  type: 'object',
  properties: {
    scrollDelay: {
      type: 'integer',
      minimum: 100,
    },
    pageDelay: {
      type: 'integer',
      minimum: 500,
    },
  },
}

router.patch(
  '/configuration',
  // @ts-ignore
  expressJsonschema.validate({ body: configurationSchema }),
  (req, res) => {
    if (req.body.scrollDelay) {
      display.setScrollDelay(req.body.scrollDelay)
    }
    if (req.body.pageDelay) {
      display.setPageDelay(req.body.pageDelay)
    }
    return res.status(200).send(display.getConfiguration())
  }
)

const pageSchema = {
  type: 'object',
  properties: {
    lines: {
      type: 'array',
      maxItems: config.get('lcd.rows'),
      items: {
        type: 'string',
      },
    },
    useHugeCharacters: {
      type: 'boolean',
    },
  },
}

router.post(
  '/page',
  // @ts-ignore
  expressJsonschema.validate({ body: pageSchema }),
  (req, res) => {
    const uuid = display.addPage(req.body)
    return res.send({ uuid })
  }
)

router.put(
  '/page/:uuid',
  // @ts-ignore
  expressJsonschema.validate({ body: pageSchema }),
  (req, res) => {
    const isUpdated = display.createOrUpdatePage(req.params.uuid, req.body)
    if (isUpdated) {
      return res.status(204).send()
    }
    return res.status(201).send()
  }
)

router.delete('/page/:uuid', (req, res) => {
  const isSuccessful = display.removePage(req.params.uuid)
  if (isSuccessful) {
    return res.status(204).send()
  }
  return res.status(404).send()
})

router.use((_, res) => {
  return res.status(404).send()
})

// @ts-ignore
// noinspection JSUnusedLocalSymbols
router.use((err, req, res, next) => {
  if (err.name === 'JsonSchemaValidation') {
    return res.status(400).send({ errors: err.validations })
  }
  log.error(err)
  return res.status(500).send({ error: err.message })
})

export default router
