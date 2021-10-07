export function updateObject(object, key, val) {
  object[key] = val
  return object
}

export function objectMap2Array(object, fn) {
  const arr = []

  for (const key in object)
    arr.push(fn(key, object[key]))

  return arr
}

export function objecFilter(object, fn) {
  const result = {}

  for (const key in object)
    if (fn(key, object[key]))
      result[key] = object[key]

  return result
}

export function arr2object(array, keyGetterFn) {
  let object = {}

  for (const item of array)
    object[keyGetterFn(item)] = item

  return object
}
