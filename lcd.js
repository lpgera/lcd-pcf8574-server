const config = require('config')
const LCD = require('lcdi2c')

const lcd = new LCD(
  config.get('lcd.i2c.device'),
  config.get('lcd.i2c.address'),
  config.get('lcd.columns'),
  config.get('lcd.rows')
)

module.exports = lcd
