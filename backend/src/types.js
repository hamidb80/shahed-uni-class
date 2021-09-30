import { matchesStructure, validateStructure } from 'validate-structure'

export const types = {
  Class: {
    "teacher": "string",
    "lesson": "string",
    "program[7]": "Day",
  },

  Day: "number[]",
}

export function validateClass(object) {
  return validateStructure(object, "Class", true, types)
}