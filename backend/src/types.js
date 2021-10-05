import { validateStructure, buildError } from 'validate-structure'

export const types = {
  Day: "number[]",
  Class: {
    "teacher": "string",
    "lesson": "string",
    "description": "string",
    "program[7]": "Day",
  },

  Event: {
    "name": "string",
    "type": "string",
    "classId?": "string",
    "description": "string",
    "datetime": DateTimeValiator, // time
  },
}

function DateTimeValiator(val) {
  return []
  return buildError(`'${val}' does not start with a '$'`)
}

export function validateClass(object) {
  return validateStructure(object, "Class", true, types)
}
export function validateEvent(object) {
  return validateStructure(object, "Event", true, types)
}