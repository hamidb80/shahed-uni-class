import { DBPATH } from "./config.js"
import fs from "fs"
import { promisify } from "util"

const
  readFile = promisify(fs.readFile),
  writeFile = promisify(fs.writeFile)

export async function saveDB(classesMap, remindersMap) {
  await writeFile(DBPATH, JSON.stringify({ classes: classesMap, reminders: remindersMap }))
}

export async function readDB() {
  return JSON.parse(await readFile(DBPATH))
}

export async function initDB() {
  if (!fs.existsSync(DBPATH))
    saveDB({}, {})
}