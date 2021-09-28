import TelegramBot from 'node-telegram-bot-api'
import express from 'express'

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/', (req, res) => {
  res.send(req.body)
  bot.sendMessage(GROUP_CHATID, req.body.msg)
})

const GROUP_CHATID = -1001324766857

const bot = new TelegramBot(
  process.env.TBOT_TOKEN,
  { polling: true }
)

bot.on("message", (msg) => {
  if (msg.text === '/start')
    bot.sendMessage(msg.chat.id, "در حال اجرا")
})

app.listen(3000, () => {})
