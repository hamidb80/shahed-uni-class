import randint from "random-int"

function iter(from, to, step) {
  let result = []

  for (let current = from; current <= to; current += step)
    result.push(current)

  return result
}

function clockify(n) {
  return (n >= 10 ? "" : "0") + n
}

export function minutes2TimeArray(m) {
  return [clockify(Math.floor(m / 60)), clockify(m % 60)]
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
  times = iter(8 * 60, 22 * 60, timeSpace) // from 8:00 to 22:00 by 30 mins


const classColors = [
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#2196f3",
  "#8bc34a",
  "#ffc107"
]

export function genProgram(classesMap) {
  let result = []

  for (let dayIndex = 0; dayIndex < 7; dayIndex++)
    result.push([])

  for (let classId in classesMap) {
    let
      cls = classesMap[classId],
      color = classColors[randint(classColors.length - 1)]

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      for (let timeRange of cls["program"][dayIndex]) {
        result[dayIndex].push({
          classId, color,
          start: timeRange[0],
          end: timeRange[1],
          heightOffset: 0,
        })
      }
    }
  }

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    let heightAcc = 0
    for (let clsItem of result[dayIndex]) {
      clsItem.heightOffset = heightAcc
      heightAcc += clsItem.end - clsItem.start
    }
  }
  return result
}
