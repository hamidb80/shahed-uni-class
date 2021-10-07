export function spliceArray(arr, fn) {
  const
    matched = [],
    unMatched = []

  for (const item of arr)
    if (fn(item))
      matched.push(item)
    else
      unMatched.push(item)


  // apply on array
  arr.length = 0
  for (const item of unMatched)
    arr.push(item)

  return matched
}


export function object2array(object) {
  let res = []

  for (const key in object)
    res.push(object[key])

  return res
}