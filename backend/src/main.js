import express from 'express'
import cors from 'cors'
import TelegramBot from 'node-telegram-bot-api'
import path from 'path'

import pickRandom from 'pick-random'
import { difference } from "set-operations"
import moment from 'moment'

import { validateClass, validateEvent } from './types.js'
import { getClassShortInfo, getTraningInfo, getEventInfo, border, applyBorder } from './serialize.js'
import { db, COLLECTIONS, runQuery, upsert, remove, removeMany } from './db.js'
import { objectMap2Array, objecFilter, arr2object } from '../utils/object.js'
import { spliceArray, object2array } from '../utils/array.js'
import { getClassTimeIndex, getCurrentWeekTimeInfo, classTimes } from '../utils/time.js'

import { TG_TOKEN, SECRET_KEY, GROUP_CHATID } from './config.js'

import axios from 'axios'
import nodehtml from 'node-html-parser'

// init services --------------------------
const __dirname = path.resolve()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('./dist'))

const bot = new TelegramBot(TG_TOKEN, { polling: true })

// app data ------------------------------------

let
  classes = {}, // class_id => class
  trainings = [], // 
  events = [],
  program = [] // array of day | day is array of time | time is array of class_ids

function resetProgram() {
  program = []
  for (let di = 0; di < 7; di++) { // day index
    program[di] = []

    for (let ti = 0; ti < 7; ti++) // time index
      program[di][ti] = []
  }
}

function processData(classesArray, eventArray) {
  resetProgram()
  for (let di = 0; di < 7; di++) { // day index
    for (let ti = 0; ti < 7; ti++) { // time index
      program[di][ti] =
        classesArray
          .filter(cls => cls.program[di].includes(ti))
          .map(cls => cls["_id"])
    }
  }

  classes = arr2object(classesArray, cls => cls["_id"])

  trainings = arr2object(spliceArray(eventArray, ev => ev.type === "training"), tr => tr["_id"])
  events = arr2object(eventArray, ev => ev["_id"])
}

// ------------------- database 

async function updateData() {
  processData(
    await runQuery(
      async () => await db.collection(COLLECTIONS.classes).find().toArray()),

    await runQuery(
      async () => await db.collection(COLLECTIONS.events).find().toArray())
  )
}

// web service --------------------------------------

function checkSecretKey(next) {
  return (req, res) => {
    if (req.headers["secret-key"] === SECRET_KEY)
      next(req, res)
    else
      res.status(401).send({ msg: "you are not an admin", headers: req.headers })
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', '/page.html'))
})

app.get('/api/now', (req, res) => {
  res.send(moment().format())
})
app.get('/api/getAll', async (req, res) => {
  res.send({ classes, program, trainings, events })
})

app.post('/api/verify', (req, res) => {
  res.send({ result: req.body.secretKey === SECRET_KEY })
})
app.post('/api/update', checkSecretKey(async (req, res) => {
  await updateData()
  res.send({ result: "ok" })
}))

app.post('/api/class', checkSecretKey(async (req, res) => {
  let errors = validateClass(req.body)
  if (errors.length === 0)
    res.send(await upsert(COLLECTIONS.classes, req.body, undefined, updateData))
  else
    res.status(400).send(errors)
}))
app.put('/api/class/:cid', checkSecretKey(async (req, res) => {
  let errors = validateClass(req.body)
  if (errors.length === 0)
    res.send(await upsert(COLLECTIONS.classes, req.body, req.params.cid, updateData))
  else
    res.status(400).send(errors)
}))
app.delete('/api/class/:cid', checkSecretKey(async (req, res) => {
  await removeMany(COLLECTIONS.events, { "classId": req.params.cid })
  res.send(await remove(COLLECTIONS.classes, req.params.cid, updateData))
}))

app.post('/api/event', checkSecretKey(async (req, res) => {
  let errors = validateEvent(req.body)
  if (errors.length === 0)
    res.send(await upsert(COLLECTIONS.events, req.body, undefined, updateData))
  else
    res.status(400).send(errors)
}))
app.put('/api/event/:evid', checkSecretKey(async (req, res) => {
  let errors = validateEvent(req.body)
  if (errors.length === 0)
    res.send(await upsert(COLLECTIONS.events, req.body, req.params.evid, updateData))
  else
    res.status(400).send(errors)
}))
app.delete('/api/event/:evid', checkSecretKey(async (req, res) => {
  res.send(await remove(COLLECTIONS.events, req.params.evid, updateData))
}))

// telegram bot -------------------------

app.post('/api/bot/', checkSecretKey((req, res) => {
  send2Group(req.body.msg)
  res.send(req.body)
}))

function send2Group(msg) {
  bot.sendMessage(GROUP_CHATID, msg)
}

bot.on("message", async (msg) => {
  function send(text) {
    bot.sendMessage(msg.chat.id, text)
  }

  if (msg.text.startsWith('/start'))
    send([
      "دستورات:",
      "\n\n",
      [
        ["/check", "بررسی وضعیت"],
        ["/classes", "کلاس های در حال برگزاری"],
        ["/trainings", "تمرین ها"],
        ["/events", "رویداد ها"],
        ["/fal", "فال"],
      ].map(arr => arr.join('  ')).join("\n"),
    ].join(' '))

  else if (msg.text.startsWith('/check'))
    send(pickRandom([
      "جانم فدایتان اعلی حضرت",
      "شما امر بفرما",
      "حواسمو پرت نکن",
      "عهههههه دارم کار میکنم",
      "چییییههه؟",
      "ساکت لطفا",
      "...",
      "هعی",
    ])[0])

  else if (msg.text.startsWith('/classes')) {
    let currentClasses = currentClassIds(getCurrentWeekTimeInfo()).map(cid => classes[cid])
    send([
      [
        "هم اکنون",
        currentClasses.length,
        "کلاس در حال برگزاری است",
      ].join(' '),
      border,
      currentClasses.map(cls => `\n- ${getClassShortInfo(cls)}`).join("\n")
    ].join('\n'))
  }

  else if (msg.text.startsWith('/trainings')) {
    let trArray = object2array(trainings)

    send([
      "تعداد",
      trArray.length,
      "تمرین موجود میباشد",
      "\n",
      trArray.map(tr => applyBorder(getTraningInfo(tr, classes))).join("\n\n")
    ].join(" "))
  }

  else if (msg.text.startsWith('/events')) {
    let evArray = object2array(events)

    send([
      "تعداد",
      evArray.length,
      "رویداد وجود دارد",
      "\n",
      evArray.map(ev => applyBorder(getEventInfo(ev, classes))).join("\n\n")
    ].join(" "))
  }
  else if(msg.text.startsWith('/fal'))
  {
    send([':فال شما \n ', await fal()].join('\n '))
  }
})

// --------------------------------

let
  lastClassIds = [],
  lastBeforeClassIds = []

function currentClassIds(now) {
  let classTimeIndex = getClassTimeIndex(now.mtime, classTimes)

  return objectMap2Array(
    objecFilter(
      classes,
      (_, cls) => cls.program[now.dayIndex].includes(classTimeIndex)
    ),
    (id, cls) => id)
}

function task() {
  console.log('task')

  let
    newClassIds = currentClassIds(getCurrentWeekTimeInfo()),
    newBeforeClassIds = currentClassIds(getCurrentWeekTimeInfo(moment.duration(15, "minutes")))

  for (const clsId of difference(newClassIds, lastClassIds))
    send2Group([
      getClassShortInfo(classes[clsId]),
      "در حال برگزاری است",
    ].join(' '))

  for (const clsId of difference(newBeforeClassIds, lastBeforeClassIds))
    send2Group([
      getClassShortInfo(classes[clsId]),
      "دقایقی دیگر برگزار میشود",
    ].join(' '))

  lastClassIds = newClassIds
  lastBeforeClassIds = newBeforeClassIds
}

function runScheduler() {
  task()
  return setInterval(task, 60 * 1000)
}

 async function fal() {
    const parse = nodehtml.parse
    let respose = await axios.get('https://c.ganjoor.net/beyt.php')
    let page = parse(respose.data)
    let first_element = page.querySelectorAll('.ganjoor-m1').map(el => el.text)
    let second_element = page.querySelectorAll('.ganjoor-m2').map(el => el.text)
    first_element = first_element.toString()
    let Random_beyt = first_element + "  ***  " + second_element
    return Random_beyt
}
// ----------------------------

app.listen(3000, async () => {
  console.log('running ...')
  await updateData()
  runScheduler()
})

