import express from 'express'
import cors from 'cors'
import TelegramBot from 'node-telegram-bot-api'
import path from 'path'
import { v4 as uuid } from 'uuid'

import { difference } from "set-operations"
import moment from 'moment'

import { validateClass, validateEvent } from './types.js'
import { getClassShortInfo, getEventInfo } from './serialize.js'
import { initDB, readDB, saveDB } from './db.js'
import { objectMap2Array, objecFilter, arr2object } from '../utils/object.js'
import { object2array } from '../utils/array.js'
import { getCurrentWeekTimeInfo } from '../utils/time.js'
import { bold, markdownV2Escape } from '../utils/tg.js'

import { TG_TOKEN, SECRET_KEY, GROUP_CHATID } from './config.js'
import { fal, HadithOfDay } from "./dataCollector.js"
import { isBetween } from '../utils/math.js'
const __dirname = path.resolve()
// init services --------------------------

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('./dist'))

const
  bot = new TelegramBot(TG_TOKEN, { polling: true }),
  MSG_OPTIONS = {}
// app data ------------------------------------

let
  classesMap = {}, // class_id => class
  remindersMap = {}

let reminderSort = (a, b) => a.datetime < b.datetime ? -1 : +1

function getEvents() {
  return object2array(objecFilter(remindersMap, (_, ev) => ev.type === "event"))
    .sort(reminderSort)
}
function getTrainings() {
  return object2array(objecFilter(remindersMap, (_, ev) => ev.type === "training"))
    .sort(reminderSort)
}

// ------------------- database 

function appendId(obj, id = null) {
  if (id == null)
    id = uuid()

  obj["_id"] = id
}

async function syncDB(firstTime = false) {
  if (!firstTime)
    await saveDB(classesMap, remindersMap)

  let data = await readDB()
  classesMap = data.classes
  remindersMap = data.reminders
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
  res.send({ classes: classesMap, trainings: getTrainings(), events: getEvents() })
})
app.post('/api/verify', (req, res) => {
  res.send({ result: req.body.secretKey === SECRET_KEY })
})

app.post('/api/class', checkSecretKey(async (req, res) => {
  let
    newClass = req.body,
    errors = validateClass(newClass)

  if (errors.length === 0) {
    appendId(newClass)
    classesMap[newClass._id] = newClass
    await syncDB()
    res.send(newClass)
  }
  else
    res.status(400).send(errors)
}))
app.put('/api/class/:cid', checkSecretKey(async (req, res) => {
  let
    edittedClass = req.body,
    cid = req.params.cid,
    errors = validateClass(edittedClass)

  if (errors.length === 0 && cid in classesMap) {
    classesMap[cid] = appendId(edittedClass, cid)
    await syncDB()
    res.send(edittedClass)
  }
  else
    res.status(400).send(errors)
}))
app.delete('/api/class/:cid', checkSecretKey(async (req, res) => {
  let cid = req.params.cid
  remindersMap = objecFilter(remindersMap, (_, ev) => ev["classId"] != cid)
  classesMap[cid] = undefined
  await syncDB()
  res.send()
}))

app.post('/api/reminder', checkSecretKey(async (req, res) => {
  let
    newEvent = req.body,
    errors = validateEvent(newEvent)

  if (errors.length === 0) {
    appendId(newEvent)
    remindersMap[newEvent._id] = newEvent
    await syncDB()
    res.send(newEvent)
  } else
    res.status(400).send(errors)
}))
app.put('/api/reminder/:evid', checkSecretKey(async (req, res) => {
  let
    edittedEvent = req.body,
    errors = validateEvent(edittedEvent),
    evid = req.params.evid

  if (errors.length === 0) {
    remindersMap[evid] = appendId(edittedEvent, evid)
    await syncDB()
    res.send()
  }
  else
    res.status(400).send(errors)
}))
app.delete('/api/reminder/:evid', checkSecretKey(async (req, res) => {
  remindersMap[req.params.evid] = undefined
  await syncDB()
  res.send()
}))

// telegram bot -------------------------

app.post('/api/bot/sendText', checkSecretKey((req, res) => {
  send2Group(req.body.msg)
  res.send(req.body)
}))

function getMsgOption(markdown) {
  return { ...MSG_OPTIONS, parse_mode: markdown ? "MarkdownV2" : undefined }
}

function send2Group(msg, markdown = false) {
  bot.sendMessage(GROUP_CHATID, msg, getMsgOption(markdown))
}

function getEventInfoWithNumber(tr, index) {
  return `\\#${index + 1}\n${getEventInfo(tr, classesMap)}`
}

bot.on("message", async (msg) => {
  function send(text, markdown = false) {
    bot.sendMessage(msg.chat.id, text, getMsgOption(markdown))
  }

  if (!msg.text) return
  try {
    if (msg.text.startsWith('/start')) {
      send([
        bold("دستورات:"),
        "\n\n",
        [
          ["/classes", "کلاس های در حال برگزاری"],
          ["/trainings", "تمرین ها"],
          ["/events", "رویداد ها"],
          ["/fal", "فال"],
          ["/hadis", "حدیث امروز"],
        ].map(arr => arr.join('  ')).join("\n"),
      ].join(' '), true)
    }
    else if (msg.text.startsWith('/classes')) {
      let currentClasses = getCurrentClassIds(getCurrentWeekTimeInfo()).map(cid => classesMap[cid])
      send([
        [
          "هم اکنون",
          currentClasses.length,
          "کلاس در حال برگزاری است",
        ].join(' '),
        "\n",
        currentClasses.map(cls => [
          markdownV2Escape("\n >>  "), getClassShortInfo(cls)].join('')
        ).join("\n")
      ].join('\n'), true)
    }
    else if (msg.text.startsWith('/trainings')) {
      let trArray = getTrainings()

      send([
        "تعداد",
        trArray.length,
        "تمرین موجود میباشد",
        "\n",
        trArray.map(getEventInfoWithNumber).join("\n\n\n")
      ].join(" "), true)
    }
    else if (msg.text.startsWith('/events')) {
      let evArray = getEvents()

      send([
        "تعداد",
        evArray.length,
        "رویداد وجود دارد",
        "\n",
        evArray.map(getEventInfoWithNumber).join("\n\n\n")
      ].join(" "), true)
    }
    else if (msg.text.startsWith('/fal')) {
      send(['فال شما: \n', await fal()].join('\n'), true)
    }
    else if (msg.text.startsWith('/hadis')) {
      send(['حدیث امروز :\n', await HadithOfDay()].join('\n'), true)
    }
  } catch (e) { }
})

// --------------------------------

let
  lastClassIds = [],
  lastBeforeClassIds = []

function getCurrentClassIds(now) {
  return objectMap2Array(
    objecFilter(
      classesMap,
      (_, cls) => cls.program[now.dayIndex].some(timeRange => isBetween(now.mtime, ...timeRange))
    ),
    (id, _) => id)
}

function resolveClassInfo(clsId, index) {
  return `${index + 1} \\. ${getClassShortInfo(classesMap[clsId], true)}`
}

function task() {
  let
    currentClassIds = getCurrentClassIds(getCurrentWeekTimeInfo()),
    currentBeforeClassIds = getCurrentClassIds(getCurrentWeekTimeInfo(moment.duration(15, "minutes")))

  // ---------------------------------

  let prepareClassList = difference(currentBeforeClassIds, lastBeforeClassIds, true).map(resolveClassInfo)
  if (prepareClassList.length)
    send2Group([
      "دقایقی دیگر برگزار میشود",
      "\n",
      ...prepareClassList,
    ].join('\n'), true)


  let presentClassList = difference(currentClassIds, lastClassIds, true).map(resolveClassInfo)
  if (presentClassList.length)
    send2Group([
      "در حال برگزاری است",
      "\n",
      ...presentClassList,
    ].join("\n"), true)

  // --------------------------------

  lastClassIds = currentClassIds
  lastBeforeClassIds = currentBeforeClassIds
}

// ----------------------------

function runScheduler() {
  task()
  return setInterval(task, 30 * 1000)
}

app.listen(3000, async () => {
  console.log('running server ...')
  await initDB()
  await syncDB(true)
  console.log('database initilized')
  runScheduler()
  console.log('scheduler started')
})
