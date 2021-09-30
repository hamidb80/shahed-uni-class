import { MongoClient } from 'mongodb'
import { MONGODB_CONNECTION_URI } from './config.js'


export const
  mdb = new MongoClient(MONGODB_CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }),
  scc = mdb.db("shahed").collection("classes") // shahed class collection

export async function runQuery(fn) {
  await mdb.connect().catch(console.log)
  let res = await fn()
  mdb.close()
  return res
}
