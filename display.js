const config = require('config')
const LCD = require('lcdi2c')
const _ = require('lodash')
const uuid = require('uuid')
const log = require('./log').child({module: 'display'})

const lcd = new LCD(
  config.get('lcd.i2c.device'),
  config.get('lcd.i2c.address'),
  config.get('lcd.columns'),
  config.get('lcd.rows')
)

const displayConfiguration = {
  scrollDelay: 250,
  pageDelay: 5000,
}

const displayData = {
  currentPage: 0,
  lineOffsets: [
    0,
    0,
  ],
  pages: {
    uuid1: [
      'Hello world!',
      'This is something longer...',
    ],
    uuid2: [
      'Let\'s test a new page.',
    ],
  },
}

function getCurrentPage() {
  const pageIds = Object.keys(displayData.pages)
  const currentPageId = _.get(pageIds, displayData.currentPage)
  const currentPage = displayData.pages[currentPageId]
  return currentPage || []
}

function updateDisplay() {
  const currentPage = getCurrentPage()
  const lines = _.map(currentPage, (line, index) => {
    const lineOffset = displayData.lineOffsets[index]
    if (lineOffset < 0) {
      const lineLimited = line.substr(0, config.get('lcd.columns')).substr(0, 16 + lineOffset)
      const linePadded = lineLimited.padStart(config.get('lcd.columns'))
      return linePadded
    }
    const lineLimited = line.substr(lineOffset, config.get('lcd.columns'))
    const linePadded = lineLimited.padEnd(config.get('lcd.columns'))
    return linePadded
  })
  _.each(lines, (line, index) => {
    lcd.println(line, index + 1)
  })
}

function scroll() {
  const currentPage = getCurrentPage()
  _.each(currentPage, (line, index) => {
    if (_.size(line) > config.get('lcd.columns')) {
      const diff = _.size(line) - config.get('lcd.columns')
      displayData.lineOffsets[index] = displayData.lineOffsets[index] + 1
      if (displayData.lineOffsets[index] > diff + config.get('lcd.columns')) {
        displayData.lineOffsets[index] = -config.get('lcd.columns') + 1
      }
    } else {
      displayData.lineOffsets[index] = 0
    }
  })
  updateDisplay()
}

function page() {
  if (Object.keys(displayData.pages).length <= 1) {
    displayData.currentPage = 0
    return
  }
  displayData.currentPage = displayData.currentPage + 1
  if (displayData.currentPage >= Object.keys(displayData.pages).length) {
    displayData.currentPage = 0
  }
  displayData.lineOffsets = _.times(config.get('lcd.rows'), _.constant(0))
  lcd.clear()
  updateDisplay()
}

let scrollTimer = setInterval(scroll, displayConfiguration.scrollDelay)
let pageTimer = setInterval(page, displayConfiguration.pageDelay)

function on() {
  log.debug('turning display on')
  lcd.on()
}

function off() {
  log.debug('turning display off')
  lcd.off()
}

function setScrollDelay(scrollDelay) {
  log.debug('updating scroll delay to:', scrollDelay)
  displayConfiguration.scrollDelay = scrollDelay
  clearTimeout(scrollTimer)
  scrollTimer = setInterval(scroll, displayConfiguration.scrollDelay)
}

function setPageDelay(pageDelay) {
  log.debug('updating page delay to:', pageDelay)
  displayConfiguration.pageDelay = pageDelay
  clearTimeout(pageTimer)
  pageTimer = setInterval(page, displayConfiguration.pageDelay)
}

function getConfiguration() {
  return displayConfiguration
}

function addPage(pageToAdd) {
  const pageUuid = uuid.v4()
  displayData.pages[pageUuid] = pageToAdd
  return pageUuid
}

function addPageWithUuid(pageUuid, pageToAdd) {
  if (displayData.pages[pageUuid]) {
    return false
  }
  displayData.pages[pageUuid] = pageToAdd
  return true
}

function updatePage(pageUuid, pageToUpdate) {
  if (!displayData.pages[pageUuid]) {
    return false
  }
  displayData.pages[pageUuid] = pageToUpdate
  return true
}

function removePage(pageUuid) {
  if (!displayData.pages[pageUuid]) {
    return false
  }
  delete displayData.pages[pageUuid]
  lcd.clear()
  return true
}

module.exports = {
  on,
  off,
  setScrollDelay,
  setPageDelay,
  getConfiguration,
  addPage,
  addPageWithUuid,
  updatePage,
  removePage,
}