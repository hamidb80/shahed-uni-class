import moment from 'moment'
import jalaali from 'jalaali-js'

import { modulo } from "./math.js"
import PN from "persian-number"

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

export function clockNumber(n) {
  return n < 10 ? "0" + n : n + ""
}

export function toPersianDate(datetime) {
  let
    jdate = jalaali.toJalaali(datetime),
    t = [
      jdate.jy,
      jdate.jm,
      jdate.jd,
      datetime.getHours(),
      datetime.getMinutes(),
    ].map(t => clockNumber(t))

  return PN.convertEnToPe(t.slice(0, 3).join("/") + " | " + t.slice(3, 5).join(":"))
}

export const persianWeekDays = [
  "یکشنبه",
  "دوشنبه",
  "سه شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
]