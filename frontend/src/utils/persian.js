const latin2persionDigits= {
  "0": '۰',
  "1": '۱',
  "2": '۲',
  "3": '۳',
  "4": '۴',
  "5": '۵',
  "6": '۶',
  "7": '۷',
  "8": '۸',
  "9": '۹',
}

export function convertLatin2PersianDigits(str){
  let res = ""
  for (const c of str)
    res += latin2persionDigits[c] || c

  return res
}