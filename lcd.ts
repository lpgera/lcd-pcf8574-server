import config from 'config'
import LCD from 'lcdi2c'

export default new LCD(
  config.get('lcd.i2c.device'),
  config.get('lcd.i2c.address'),
  config.get('lcd.columns'),
  config.get('lcd.rows')
)
