import { convertLatin2PersianDigits } from "./persian";


export const

  classTimes = [
    "8 - 9:30",
    "9:30 - 11",
    "11 - 12:30",
    "13:30 - 15",
    "15 - 16:30",
    "16:30 - 18",
    "18 - 19:30",
  ].map(convertLatin2PersianDigits),

  weekDays = [
    "شنبه",
    "یک شنبه",
    "دو شنبه",
    "سه شنبه",
    "چهارشنبه",
    "پنج شنبه",
    "جمعه",
  ]