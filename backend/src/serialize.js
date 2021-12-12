import { toPersianDate, persianWeekDays } from '../utils/time.js'
import { bold, italic, underline, markdownV2Escape } from '../utils/tg.js'

export function getClassShortInfo(cls, addNotes = false) {
  return [
    "کلاس",
    italic(markdownV2Escape(cls["lesson"])),
    "با",
    underline(markdownV2Escape(cls["teacher"])),
    (addNotes
      ? "\n" + markdownV2Escape(cls["notes"])
      : ''
    ),
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

export function getEventInfo(tr, classesObject) {
  let datetime = new Date(tr["datetime"])
  return [
    ["عنوان", tr["name"]],
    ["تاریخ", getDateWithWeekDay(datetime)],
    [getClassShortInfo(classesObject[tr["classId"]])],
    ["توضیحات", tr["description"]],
  ].map(pairMarkup).join('\n')
}