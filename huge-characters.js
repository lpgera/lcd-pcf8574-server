const lcd = require('./lcd')

const u = 0 // upper half
const l = 1 // lower half
const f = 2 // full
const e = 3 // empty

lcd.createChar(u, [31, 31, 31, 31, 0, 0, 0, 0])
lcd.createChar(l, [0, 0, 0, 0, 31, 31, 31, 31])
lcd.createChar(f, [31, 31, 31, 31, 31, 31, 31, 31])
lcd.createChar(e, [0, 0, 0, 0, 0, 0, 0, 0])

// prettier-ignore
const characters = {
  '0': [
    [l, u, u, l],
    [f, e, e, f],
    [f, e, e, f],
    [e, u, u, e],
  ],
  '1': [
    [e, l, f, e],
    [u, e, f, e],
    [e, e, f, e],
    [e, e, u, e],
  ],
  '2': [
    [l, u, u, l],
    [e, e, l, u],
    [l, u, e, e],
    [u, u, u, u],
  ],
  '3': [
    [l, u, u, l],
    [e, l, l, u],
    [l, e, e, f],
    [e, u, u, e],
  ],
  '4': [
    [e, e, l, f],
    [l, u, e, f],
    [u, u, u, f],
    [e, e, e, u],
  ],
  '5': [
    [f, u, u, u],
    [f, l, l, e],
    [e, e, e, f],
    [u, u, u, e],
  ],
  '6': [
    [l, u, u, l],
    [f, l, l, e],
    [f, e, e, f],
    [e, u, u, e],
  ],
  '7': [
    [u, u, u, f],
    [e, l, u, e],
    [l, u, e, e],
    [u, e, e, e],
  ],
  '8': [
    [l, u, u, l],
    [u, l, l, u],
    [f, e, e, f],
    [e, u, u, e],
  ],
  '9': [
    [l, u, u, l],
    [u, l, l, f],
    [l, e, e, f],
    [e, u, u, e],
  ],
  'B': [
    [f, u, u, l],
    [f, l, l, u],
    [f, e, e, f],
    [u, u, u, e],
  ],
  'C': [
    [l, u, u, l],
    [f, e, e, e],
    [f, e, e, l],
    [e, u, u, e],
  ],
  'K': [
    [f, e, e, f],
    [f, l, u, e],
    [f, e, u, l],
    [u, e, e, u],
  ],
  '|': [
    [],
    [],
    [],
    [],
  ],
  ':': [
    [e],
    [u],
    [u],
    [e],
  ],
  '.': [
    [e],
    [e],
    [e],
    [u],
  ],
  '°': [
    [l, u, l],
    [e, u, e],
    [e, e, e],
    [e, e, e],
  ],
  '-': [
    [e, e],
    [l, l],
    [e, e],
    [e, e],
  ],
}

const stringFromBytes = bytes => bytes.map(b => String.fromCharCode(b)).join('')

const convertToLines = string =>
  string
    .split('')
    .map(c => characters[c])
    .reduce(
      (acc, c) =>
        c.map((cLine, i) => (acc[i] ? [...acc[i], e, ...cLine] : [...cLine])),
      []
    )
    .map(bytes => stringFromBytes(bytes))

module.exports = {
  convertToLines,
}
