import { readFileSync } from "fs"
import YAML from 'yaml'

let data = YAML.parse(readFileSync("./fandogh.yml", "utf-8"))

for (let evar of data['spec']['env'])
  process.env[evar["name"]] = evar["value"]

import("./main.js")