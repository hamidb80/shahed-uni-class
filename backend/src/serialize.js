import { toPersianDate } from '../utils/time.js'

export function getClassShortInfo(cls) {
  return [
    "کلاس",
    cls["lesson"],
    "با",
    cls["teacher"]
  ].join(' ')
}

export function getTraningInfo(tr, classesObject) {
  return [
    ["عنوان", tr["name"]],
    ["تاریخ تحویل", toPersianDate(tr["datetime"])],
    [getClassShortInfo(classesObject[tr["classId"]])],
    ["توضیحات", tr["description"]],
  ].map(arr => arr.join(': ')).join('\n')
}

export function getEventInfo(tr, classesObject) {
  return [
    ["عنوان", tr["name"]],
    ["تاریخ", toPersianDate(tr["datetime"])],
    [getClassShortInfo(classesObject[tr["classId"]])],
    ["توضیحات", tr["description"]],
  ].map(arr => arr.join(': ')).join('\n')
}

export const border = "------------------"
export function applyBorder(text) {
  return [border, text, border].join('\n')
}