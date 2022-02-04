import { validateStructure, buildError } from 'validate-structure'
import moment from 'moment'

export const types = {
  TimeRange: "number[2]", // in minutes. eg: [60, 140] => 01:00 until 02:20
  Day: "TimeRange[]",
  
  Class: {
    "teacher": "string",
    "lesson": "string",
    "description": "string",
    "notes": "string",
    "program[7]": "Day",
  },

  Event: {
    "name": "string",
    "type": "string",
    "classId": "string",
    "description": "string",
    "datetime": DateTimeValiator, // time
  },
}

function DateTimeValiator(val) {
  return typeof val === 'string' && moment(val).isValid() ?
    [] :
    buildError("is not a valid datetime format")
}

export function validateClass(object) {
  return validateStructure(object, "Class", true, types)
}
export function validateEvent(object) {
  return validateStructure(object, "Event", true, types)
}