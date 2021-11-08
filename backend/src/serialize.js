import { toPersianDate, persianWeekDays } from '../utils/time.js'

export function getClassShortInfo(cls) {
  return [
    "کلاس",
    cls["lesson"],
    "با",
    cls["teacher"]
  ].join(' ')
}

function getDateWithWeekDay(datetime) {
  return toPersianDate(datetime) + "  " + persianWeekDays(datetime.getDay())
}

export function getTraningInfo(tr, classesObject) {
  let datetime = new Date(tr["datetime"])
  return [
    ["عنوان", tr["name"]],
    ["تاریخ تحویل", getDateWithWeekDay(datetime)],
    [getClassShortInfo(classesObject[tr["classId"]])],
    ["توضیحات", tr["description"]],
  ].map(arr => arr.join(': ')).join('\n')
}

export function getEventInfo(tr, classesObject) {
  let datetime = new Date(tr["datetime"])
  return [
    ["عنوان", tr["name"]],
    ["تاریخ", getDateWithWeekDay(datetime)],
    [getClassShortInfo(classesObject[tr["classId"]])],
    ["توضیحات", tr["description"]],
  ].map(arr => arr.join(': ')).join('\n')
}

export const border = "------------------"
export function applyBorder(text) {
  return [border, text, border].join('\n')
}