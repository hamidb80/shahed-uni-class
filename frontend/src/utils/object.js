export function extractObjectKeysAs(object, keyPairs) {
  // {name: "ali"}, ["name", "title"] => {title: "ali"}
  let result = {}

  for (const kp of keyPairs)
    result[kp[1]] = object[kp[0]]

  return result
}

export function extractKeys(object, keys) {
  let result = []

  for (const k of keys)
    result.push(object[k])

  return result
}