import moment from 'moment'
import { isBetween, modulo } from "./math.js"
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

export function getCurrentWeekTimeInfo() {
  const now = moment()
  return {
    dayIndex: modulo(now.weekday() + 1, 7),
    mtime: moment2Minutes(now)
  }
}

export function getClassTimeIndex(mCurentTime, timeRanges) {
  return timeRanges.findIndex(mtRng => isBetween(mCurentTime, ...mtRng))
}