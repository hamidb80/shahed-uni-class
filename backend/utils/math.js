export function modulo(n, base) {
  let mod = n % base
  return mod < 0 ? mode + base : mod
}

export function isBetween(v, start, end) {
  return v >= start && v <= end
}