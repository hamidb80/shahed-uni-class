import express from 'express'
import cors from 'cors'
import TelegramBot from 'node-telegram-bot-api'
import path from 'path'

import { ObjectId } from 'mongodb'
import pickRandom from 'pick-random'
import { difference } from "set-operations"
import moment from 'moment'

import { validateClass } from './types.js'
import { scc, runQuery } from './db.js'
import { updateObject, objectMap2Array, objecFilter } from '../utils/object.js'
import { isIn } from '../utils/array.js'
import { modulo } from '../utils/math.js'

import { TG_TOKEN, SECRET_KEY, GROUP_CHATID } from './config.js'

// init services --------------------------
const __dirname = path.resolve();

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('./dist'))

const bot = new TelegramBot(TG_TOKEN, { polling: true })

// app data ------------------------------------

let
  classes = {}, // class_id => class
  program = [] // array of day | day is array of time | time is array of class_ids

function resetProgram() {
  program = []
  for (let di = 0; di < 7; di++) { // day index
    program[di] = []

    for (let ti = 0; ti < 7; ti++) // time index
      program[di][ti] = []
  }
}

function processData(classesArray) {
  resetProgram()

  for (let di = 0; di < 7; di++) { // day index
    for (let ti = 0; ti < 7; ti++) { // time index
      program[di][ti] =
        classesArray
          .filter(cls => cls.program[di].includes(ti))
          .map(cls => cls["_id"])
    }
  }

  classes = classesArray.reduce((o, cls) => updateObject(o, cls["_id"], cls), {})
}

// database connection

async function updateData() {
  processData(
    await runQuery(
      async () => await scc.find().toArray()))
}

async function upsertClass(clsObject, clsId) {
  let result = await runQuery(
    async () => await scc.updateOne(
      { _id: ObjectId(clsId) },
      { $set: clsObject },
      { upsert: true }
    ))

  await updateData()
  return result
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
  res.sendFile(path.join(__dirname, 'dist', '/page.html'));
})

app.get('/api/getAll', async (req, res) => {
  res.send({ classes, program })
})
app.post('/api/update', async (req, res) => {
  await updateData()
  res.send({ result: "ok" })
})

app.post('/api/verify', (req, res) => {
  res.send({ result: req.body.secretKey === SECRET_KEY })
})

app.post('/api/class', checkSecretKey(async (req, res) => {
  let errors = validateClass(req.body)
  if (errors.length === 0)
    res.send(await upsertClass(req.body, ObjectId()))

  else res.status(400).send(errors)
}))
app.put('/api/class/:cid', checkSecretKey(async (req, res) => {
  let errors = validateClass(req.body)
  if (errors.length === 0)
    res.send(await upsertClass(req.body, req.params.cid))

  else res.status(400).send(errors)
}))
app.delete('/api/class/:cid', checkSecretKey(async (req, res) => {
  let dbRes = await runQuery(async () => await scc.deleteOne({ _id: ObjectId(req.params.cid) }))
  await updateData()
  res.send(dbRes)
}))

app.post('/api/bot/', checkSecretKey((req, res) => {
  send2Group(req.body.msg)
  res.send(req.body)
}))


app.listen(3000, async () => {
  console.log('running ...')
  await updateData()
  runScheduler()
})

// telegram bot -------------------------
function send2Group(msg) {
  bot.sendMessage(GROUP_CHATID, msg)
}

bot.on("message", (msg) => {
  if (msg.text === '/start')
    bot.sendMessage(msg.chat.id, pickRandom([
      "عهههههه دارم کار میکنم",
      "چییییههه؟",
      "شما امر بفرما",
      "حواسمو پرت نکن",
      "ساکت لطفا",
    ])[0])
})

// --------------------------------

const classStartTimes = [
  [8, 0],
  [9, 30],
  [11, 0],
  [13, 30],
  [15, 0],
  [16, 30],
  [18, 0],
  [19, 30],
]

function isAfter(myTime, compareTime) { // times are given as arrays
  if (myTime[0] === compareTime[0])
    return myTime[1] >= compareTime[1]

  return myTime[0] >= compareTime[0]
}

function getCurrentTimeInfo() {
  const now = moment()
  return {
    dayIndex: modulo(now.weekday() + 1, 7),
    timeArr: [now.hours(), now.minute()]
  }
}

function getClassTimeIndex(timeArr) {
  let classTimeIndex = -1

  for (let i = 0; i < classStartTimes.length; i++) {
    if (isAfter(timeArr, classStartTimes[i]))
      classTimeIndex = i
    else
      return classTimeIndex
  }

  return classStartTimes.length
}

let
  lastClassTimeIndex = -1,
  lastClassIds = []

function task() {
  console.log('check')

  const time = getCurrentTimeInfo()
  let newClassTimeIndex = getClassTimeIndex(time.timeArr)

  if (isIn(newClassTimeIndex, [-1, classStartTimes.length]))
    lastClassIds = []

  else {
    let newClassIds = objectMap2Array(
      objecFilter(
        classes,
        (_, cls) => cls.program[time.dayIndex].includes(newClassTimeIndex)
      ),
      (id, cls) => id)

    for (const clsId of difference(newClassIds, lastClassIds)) {
      const cls = classes[clsId]
      send2Group([
        "کلاس درس",
        cls["lesson"],
        "با استاد",
        cls["teacher"],
        "در حال برگزاری است",
      ].join(' '))
    }

    lastClassIds = newClassIds
  }

  lastClassTimeIndex = newClassTimeIndex
}

function runScheduler() {
  task()
  return setInterval(task, 60 * 1000)
}