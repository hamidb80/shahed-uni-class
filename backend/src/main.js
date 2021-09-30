import { ObjectId } from 'mongodb'
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

import { TG_TOKEN } from './config.js'
import { validateClass } from './types.js'
import { scc, runQuery } from './db.js'
import { updateObject } from '../utils/object.js'

// init services --------------------------

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('./static'))

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
      { $set: clsObject }
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
  res.send("hey")
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
    res.send(await upsertClass(req.body, uuidv4()))

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
  // send2Group( req.body.msg)
  res.send(req.body)
}))


app.listen(3000, async () => {
  console.log('running ...')
  await updateData()
  runScheduler()
})

// telegram bot -------------------------
function send2Group(msg) {
  // bot.sendMessage(GROUP_CHATID, msg)
}

bot.on("message", (msg) => {
  if (msg.text === '/start')
    bot.sendMessage(msg.chat.id, "در حال اجرا")
})

// --------------------------------

function runScheduler(params) {
  return setInterval(() => {
    // send2Group(req.body.msg)
  }, 60 * 1000)
}