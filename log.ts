import bunyan, { Stream } from 'bunyan'

const developmentStreams = [
  {
    level: 'trace',
    stream: process.stdout,
  },
] as Stream[]

const productionStreams = [
  {
    level: 'info',
    stream: process.stdout,
  },
  {
    level: 'error',
    stream: process.stderr,
  },
] as Stream[]

export default bunyan.createLogger({
  name: 'lcd-pcf8574-server',
  streams: (() => {
    if (process.env.NODE_ENV === 'development') {
      return developmentStreams
    }
    return productionStreams
  })(),
})
