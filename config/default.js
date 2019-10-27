module.exports = {
  lcd: {
    i2c: {
      device: 1,
      address: 39,
    },
    rows: 2,
    columns: 16,
  },
  server: {
    port: 3000,
    users: {
      admin: 'password',
    },
  },
}