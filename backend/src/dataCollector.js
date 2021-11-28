import axios from 'axios'
import nodehtml from 'node-html-parser'
import { extractKeys } from '../utils/object.js'
import { createLink, markdownV2Escape } from "../utils/tg.js"

const parse = nodehtml.parse


export async function fal() {
  let respose = await axios.get('https://c.ganjoor.net/beyt.php')
  let page = parse(respose.data)
  let first_element = page.querySelector('.ganjoor-m1').text
  let second_element = page.querySelector('.ganjoor-m2').text
  let poetEl = page.querySelector('.ganjoor-poet a')
  let Random_beyt =
    markdownV2Escape(first_element + "  ***  " + second_element) +
    "\n\n" +
    createLink(poetEl.text, poetEl.getAttribute("href"))

  return Random_beyt
}

function genHadisLink(hadisId) {
  return `https://hadith.inoor.ir/fa/hadith/${hadisId}/translate`
}
export async function HadithOfDay() {
  let
    resp = await axios.get('https://hadith.inoor.ir/service/api/hadith/DailyHadith'),
    text = extractKeys(resp.data["data"], ["qael", "translateShortText"]).join("\n"),
    hadisId = resp.data["data"]["hadithId"]

  return [
    markdownV2Escape(text),
    createLink("منبع", genHadisLink(hadisId))
  ].join("\n\n")
}
