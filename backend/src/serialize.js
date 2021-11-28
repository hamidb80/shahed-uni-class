import { toPersianDate, persianWeekDays } from '../utils/time.js'
import { bold, italic, markdownV2Escape } from '../utils/tg.js'

export function getClassShortInfo(cls) {
  return [
    "کلاس",
    italic(markdownV2Escape(cls["lesson"])),
    "با",
    italic(markdownV2Escape(cls["teacher"]))
  ].join(' ')
}

function getDateWithWeekDay(datetime) {
  return toPersianDate(datetime) + "  " + persianWeekDays[datetime.getDay()]
}

function pairMarkup(arr) {
  return arr.length == 2 ?
    `${bold(arr[0])}: ${markdownV2Escape(arr[1])}` :
    arr[0]
}

export function getTraningInfo(tr, classesObject) {
  let datetime = new Date(tr["datetime"])
  return [
    ["عنوان", tr["name"]],
    ["تاریخ تحویل", getDateWithWeekDay(datetime)],
    [getClassShortInfo(classesObject[tr["classId"]])],
    ["توضیحات", tr["description"]],
  ].map(pairMarkup).join('\n')
}

export function getEventInfo(tr, classesObject) {
  let datetime = new Date(tr["datetime"])
  return [
    ["عنوان", tr["name"]],
    ["تاریخ", getDateWithWeekDay(datetime)],
    [getClassShortInfo(classesObject[tr["classId"]])],
    ["توضیحات", tr["description"]],
  ].map(pairMarkup).join('\n')
}

export const
  border = "------------------",
  escapedBorder = markdownV2Escape("------------------")

export function applyBorder(text, escape = false) {
  const myBorder = escape ? escapedBorder : border
  return [myBorder, text, myBorder].join('\n')
}