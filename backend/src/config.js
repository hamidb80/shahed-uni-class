const
  MONGODB_USER = process.env.MONGODBUSER,
  MONGODB_PASS = process.env.MONGODBPASS

export const
  SECRET_KEY = process.env.SECRETKEY,
  MONGODB_CONNECTION_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@cluster0.5ixf5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  TG_TOKEN = process.env.TGTOKEN,
  GROUP_CHATID = Number(process.env.GROUPCHATID)

