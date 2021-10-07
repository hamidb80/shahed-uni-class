import moment from 'moment'
import jalaali from 'jalaali-js'

import { isBetween, modulo } from "./math.js"
import { convertEnToPe } from "persian-number"
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

export function toPersianDate(datetime) {
  let jdate = jalaali.toJalaali(datetime)
  return convertEnToPe(
    `${jdate.jy}/${jdate.jm}/${jdate.jd} | ${datetime.getHours()}:${datetime.getMinutes()}`)
}