import _ from 'lodash'
import uuid from 'uuid'
import config from 'config'
import lcd from './lcd'
import * as hugeCharacters from './huge-characters'
import logger from './log'

const log = logger.child({ module: 'display' })

const displayConfiguration = {
  scrollDelay: 800,
  pageDelay: 8000,
}

type Page = {
  lines: string[]
  useHugeCharacters?: boolean
}

const displayData = {
  currentPage: 0,
  lineOffsets: _.times(config.get('lcd.rows'), _.constant(0)),
  pages: {} as {
    [id: string]: Page
  },
}

function getCurrentPage() {
  const pageIds = Object.keys(displayData.pages)
  const currentPageId = _.get(pageIds, displayData.currentPage)
  const currentPage = displayData.pages[currentPageId]
  if (!currentPage) {
    return []
  }
  if (currentPage.useHugeCharacters) {
    return hugeCharacters.convertToLines(currentPage.lines[0] || '')
  }
  return currentPage.lines
}

function updateDisplay() {
  const currentPage = getCurrentPage()
  if (!currentPage.length) {
    return
  }
  log.debug('current page:', currentPage)
  const lines = currentPage.map((line, index) => {
    const lineOffset = displayData.lineOffsets[index]
    if (lineOffset < 0) {
      const lineLimited = line
        .substr(0, config.get('lcd.columns'))
        .substr(0, 16 + lineOffset)
      return lineLimited.padStart(config.get('lcd.columns'))
    }
    const lineLimited = line.substr(lineOffset, config.get('lcd.columns'))
    return lineLimited.padEnd(config.get('lcd.columns'))
  })
  for (const column of _.range(config.get('lcd.columns'))) {
    for (const row of _.range(config.get('lcd.rows'))) {
      lcd.setCursor(column, row)
      lcd.print(lines[row].charAt(column))
    }
  }
}

function scroll() {
  const currentPage = getCurrentPage()
  log.debug('current page:', currentPage)
  currentPage.forEach((line, index) => {
    if (line.length > config.get<number>('lcd.columns')) {
      const diff = line.length - config.get<number>('lcd.columns')
      displayData.lineOffsets[index] = displayData.lineOffsets[index] + 1
      if (
        displayData.lineOffsets[index] >
        diff + config.get<number>('lcd.columns')
      ) {
        displayData.lineOffsets[index] = -config.get<number>('lcd.columns') + 1
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

export function on() {
  log.debug('turning display on')
  lcd.on()
}

export function off() {
  log.debug('turning display off')
  lcd.off()
}

export function setScrollDelay(scrollDelay: number) {
  log.debug('updating scroll delay to:', scrollDelay)
  displayConfiguration.scrollDelay = scrollDelay
  clearTimeout(scrollTimer)
  scrollTimer = setInterval(scroll, displayConfiguration.scrollDelay)
}

export function setPageDelay(pageDelay: number) {
  log.debug('updating page delay to:', pageDelay)
  displayConfiguration.pageDelay = pageDelay
  clearTimeout(pageTimer)
  pageTimer = setInterval(page, displayConfiguration.pageDelay)
}

export function getConfiguration() {
  return displayConfiguration
}

export function addPage(pageToAdd: Page) {
  const pageUuid = uuid.v4()
  displayData.pages[pageUuid] = pageToAdd
  return pageUuid
}

export function createOrUpdatePage(pageUuid: string, pageToUpdate: Page) {
  if (!displayData.pages[pageUuid]) {
    displayData.pages[pageUuid] = pageToUpdate
    return false
  }
  displayData.pages[pageUuid] = pageToUpdate
  return true
}

export function removePage(pageUuid: string) {
  if (!displayData.pages[pageUuid]) {
    return false
  }
  delete displayData.pages[pageUuid]
  lcd.clear()
  return true
}
