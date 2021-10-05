import { validateStructure, buildError } from 'validate-structure'

export const types = {
  Class: {
    "teacher": "string",
    "lesson": "string",
    "description": "string",
    "program[7]": "Day",
  },

  Day: "number[]",

  Training: {
    "name": "string",
    "classId": "string",
    "description": "string",
    "end": DateTimeValiator, // time
  },
}

function DateTimeValiator(val) {
  if (true) {
    return []
  }
  else {
    return buildError(`'${val}' does not start with a '$'`, path)
  }
}


export function validateClass(object) {
  return validateStructure(object, "Class", true, types)
}

export function validateTraining(object) {
  return validateStructure(object, "Training", true, types)
}