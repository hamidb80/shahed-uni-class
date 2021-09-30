const
  MONGODB_USER = process.env.MONGODB_USER,
  MONGODB_PASS = process.env.MONGODB_PASS

export const
  SECRET_KEY = process.env.SECRET_KEY,
  MONGODB_CONNECTION_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@cluster0.5ixf5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  TG_TOKEN = process.env.TG_TOKEN,
  GROUP_CHATID = -1001324766857

