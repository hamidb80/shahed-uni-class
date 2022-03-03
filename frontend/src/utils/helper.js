import randint from "random-int"
import { convertEnToPe } from "persian-number"

function iter(from, to, step) {
  let result = []

  for (let current = from; current <= to; current += step)
    result.push(current)

  return result
}

export function limit(n, start, end) {
  return Math.min(Math.max(n, start), end)
}

function clockify(n) {
  return (n >= 10 ? "" : "0") + n
}

export function minutes2TimeArray(m) {
  return [Math.floor(m / 60), m % 60]
}

export const
  weekDays = [
    "شنبه",
    "یک شنبه",
    "دو شنبه",
    "سه شنبه",
    "چهار شنبه",
    "پنج شنبه",
    "جمعه",
  ],

  timeSpace = 30,
  times = iter(7.5 * 60, 22 * 60, timeSpace) // from 8:00 to 22:00 by 30 mins


const classColors = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#2196f3",
  "#8bc34a",
  "#ffc107"
]


export function toPersianTime(minutes) {
  let ta = minutes2TimeArray(minutes)
  return convertEnToPe(`${clockify(ta[0])}:${clockify(ta[1])}`)
}

export function genProgram(classesMap) {
  let result = [[], [], [], [], [], [], []]

  for (let classId in classesMap) {
    let
      cls = classesMap[classId],
      color = classColors[randint(classColors.length - 1)]

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      for (let timeRange of cls["program"][dayIndex]) {
        result[dayIndex].push({
          _id: classId, color,
          start: timeRange[0],
          end: timeRange[1],
          timeOffset: 0,
        })
      }
    }
  }

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    let timeLenAcc = 0

    result[dayIndex].sort((a, b) => a.start - b.start)

    for (let clsItem of result[dayIndex]) {
      clsItem.timeOffset = timeLenAcc
      timeLenAcc += clsItem.end - clsItem.start
    }
  }
  return result
}

export function findIndexEnd(arr, fn) {
  for (let i = arr.length - 1; i >= 0; i--)
    if (fn(arr[i]))
      return i

  return -1
}

export function adjust(number, move, modulo) {
  let diff = number + move
  if (diff < 0)
    return modulo + diff
  else if (diff >= modulo)
    return diff % modulo
  else
    return diff
}