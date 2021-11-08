import moment from 'moment'
import jalaali from 'jalaali-js'

import { isBetween, modulo } from "./math.js"
import PN from "persian-number"
const { duration } = moment

// ----------------------------

const classDuration = duration(90, 'minutes')

export const classTimes = [
  [8, 0],
  [9, 30],
  [11, 0],
  [13, 30],
  [15, 0],
  [16, 30],
  [18, 0],
].map(arrTime => {
  let
    mStartTime = arrTime2Minutes(arrTime),
    mEndTime = moment2Minutes(duration(mStartTime, 'minutes').add(classDuration))

  return [mStartTime, mEndTime]
})

// ----------------------------

function arrTime2Minutes(arrTime) {
  return arrTime[0] * 60 + arrTime[1]
}

export function moment2Minutes(du) {
  return du.hours() * 60 + du.minutes()
}

export function getCurrentWeekTimeInfo(deltaTime) {
  const now = moment()

  if (deltaTime)
    now.add(deltaTime)

  return {
    dayIndex: modulo(now.weekday() + 1, 7),
    mtime: moment2Minutes(now)
  }
}

export function getClassTimeIndex(mCurentTime, timeRanges) {
  return timeRanges.findIndex(mtRng => isBetween(mCurentTime, ...mtRng))
}

export function clockNumber(n) {
  return n < 10 ? "0" + n : n + ""
}

export function toPersianDate(datetime) {
  let jdate = jalaali.toJalaali(datetime)
  return PN.convertEnToPe(
    `${clockNumber(jdate.jy)}/${clockNumber(jdate.jm)}/${clockNumber(jdate.jd)} | ${clockNumber(datetime.getHours())}:${clockNumber(datetime.getMinutes())}`)
}

export const persianWeekDays = [
  "یکشنبه",
  "دو شنبه",
  "شنبه سه",
  "چهار شنبه",
  "پنج شنبه",
  "جمعه",
  "شنبه",
]