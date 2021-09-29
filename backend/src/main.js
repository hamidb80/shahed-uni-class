import { MongoClient, ObjectId } from 'mongodb'
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'
import { matchesStructure } from 'validate-structure'

const
  MONGODB_USER = process.env.MONGODB_USER,
  MONGODB_PASS = process.env.MONGODB_PASS

const
  SECRET_KEY = process.env.SECRET_KEY,
  uri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@cluster0.5ixf5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  GROUP_CHATID = -1001324766857


const app = express()
// const bot = new TelegramBot(process.env.TBOT_TOKEN, { polling: true })

app.use(cors())
app.use(express.json())
app.use(express.static('./static'))


let
  classes = {}, // class_id => class
  program = [] // array of day | day is array of time | time is array of class_ids


const
  mdb = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }),
  scc = mdb.db("shahed").collection("classes") // shahed class collection

async function runQuery(fn) {
  await mdb.connect().catch(console.log)
  let res = await fn()
  mdb.close()
  return res
}

async function update() {
  processData(
    await runQuery(
      async () => await scc.find().toArray()))
}

const types = {
  Class: {
    "teacher": "string",
    "lesson": "string",
    "program[7]": "Day",
  },

  Day: "number[]",
}


function updateObject(object, key, val) {
  object[key] = val
  return object
}

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

app.get('/', (req, res) => {
  res.send("hey")
})

app.get('/api/getAll', async (req, res) => {
  res.send({ classes, program })
})

app.post('/api/verify', (req, res) => {
  res.send({ result: req.body.secretKey === SECRET_KEY })
})

function checkSecretKey(next) {
  return (req, res) => {
    if (req.headers["secret-key"] === SECRET_KEY)
      next(req, res)
    else
      res.status(401).send({ msg: "you are not an admin" })
  }
}

function matchClass(object) {
  return matchesStructure(object, "Class", true, types)
}

const structureErrorMessage = {
  msg: "class structure is invalid it should be like 'types'",
  types
}

app.post('/api/class', checkSecretKey(async (req, res) => {
  if (matchClass(req.body)) {
    let dbRes = await runQuery(async () => await scc.insertOne(req.body))
    await update()
    res.send(dbRes)
  }
  else res.status(400).send(structureErrorMessage)
}))
app.put('/api/class/:cid', checkSecretKey(async (req, res) => {
  if (matchClass(req.body)) {
    let dbRes = await runQuery(async () => await scc.updateOne({ _id: ObjectId(req.params.cid) }, req.body))
    await update()
    res.send(dbRes)
  }
  else res.status(400).send(structureErrorMessage)

}))
app.delete('/api/class/:cid', checkSecretKey(async (req, res) => {
  let dbRes = await runQuery(async () => await scc.deleteOne({ _id: ObjectId(req.params.cid) }))
  res.send(dbRes)
}))

app.post('/api/bot/', checkSecretKey((req, res) => {
  // send2Group( req.body.msg)
  res.send(req.body)
}))

function send2Group(msg) {
  // bot.sendMessage(GROUP_CHATID, msg)
}

app.listen(3000, () => {
  update()
})


function runScheduler(params) {
  return setInterval(() => {

    // send2Group(req.body.msg)

  }, 60 * 1000)
}


runScheduler()
// --------------------------------

// bot.on("message", (msg) => {
//   if (msg.text === '/start')
//     bot.sendMessage(msg.chat.id, "در حال اجرا")
// })
