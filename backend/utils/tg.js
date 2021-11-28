export function markdownV2Escape(s) {
  return s.replace(
    /([_*\[\]()~`>#+-=|{}.!])/g, "\\$1"
  )
}

export const
  createLink = (hover, link) => `[${hover}](${link})`,
  bold = (text) => `*${text}*`,
  italic = (text) => `_${text}_`,
  underline = (text) => `__${text}__`,
  strikethrough = (text) => `~${text}~`,
  code = (text) => `\`${text}\``
