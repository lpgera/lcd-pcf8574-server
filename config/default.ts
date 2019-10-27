export default {
  lcd: {
    i2c: {
      device: 1,
      address: 39,
    },
    rows: 4,
    columns: 20,
  },
  server: {
    port: 3000,
    users: {
      admin: 'password',
    },
  },
}
