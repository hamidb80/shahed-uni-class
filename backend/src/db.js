import { MongoClient, ObjectId } from 'mongodb'
import { MONGODB_CONNECTION_URI } from './config.js'


export const
  mongo = new MongoClient(MONGODB_CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }),
  db = mongo.db("shahed"),

  COLLECTIONS = {
    classes: "classes",
    events: "events"
  }

export async function runQuery(fn) {
  await mongo.connect().catch(console.log)
  let res = await fn()
  mongo.close()
  return res
}

export async function upsert(collectionName, object, id, hookfn) {
  let result = await runQuery(
    async () => await db.collection(collectionName).updateOne(
      { _id: ObjectId(id) },
      { $set: object },
      { upsert: true }
    ))

  if (hookfn) await hookfn()
  return result
}

export async function remove(collectionName, id, hookfn) {
  let result = await runQuery(
    async () => await db.collection(collectionName).deleteOne({
      _id: ObjectId(id)
    }))

  if (hookfn) await hookfn()
  return result
}

export async function removeMany(collectionName, props, hookfn) {
  let result = await runQuery(
    async () => await db.collection(collectionName).deleteMany(props))

  if (hookfn) await hookfn()
  return result
}
