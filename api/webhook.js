import fetch from 'node-fetch'

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID
const AUTH_TOKEN = process.env.AUTH_TOKEN

export default async (req, res) => {
  if (req.query.token !== AUTH_TOKEN) {
    res.status(401).json({ok: false, error: 'unauthorized', detail: ''})
    return
  }
  try {
    const text = formatMessageOrError(req.body)
    await postUpdate(text)
    res.json({ok: true})
  } catch (err) {
    res.status(500).json({ok: false, error: err.message, detail: err.stack})
  }
}

async function postUpdate(text) {
  const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({chat_id: CHAT_ID, text: text, parse_mode: 'MarkdownV2'}),
  })

  let data
  try {
    data = await resp.json()
  } catch (err) {}

  if (!data) {
    const text = await resp.text()
    if (!resp.ok) {
      throw new Error(`Telegram API HTTP error ${resp.status}: ${text}`)
    } else {
      throw new Error(`Unexpected Telegram API response: ${text}`)
    }
  }

  if (!data.ok) {
    throw new Error(`Telegram API error ${data.error_code}: ${data.description}`)
  }
}

function formatMessageOrError(data) {
  try {
    return formatMessage(data)
  } catch (err) {
    return tgEscape(
      `Failed formatting incoming message: ${JSON.stringify(data, null, '  ')}\n` +
      `Error: ${err.message}`
    )
  }
}

function formatMessage(data) {
  const isTriggered = data.state == 'triggered'
  const state = isTriggered ? '*New alert*' : 'Resolved'
  const {alert, check} = data
  const alertDesc = alert.type == 'downtime'
    ? describeDowntime(isTriggered, check)
    : describeAlert(isTriggered, alert, check)
  return `${state}: ${tgEscape(alertDesc)}`
}

function describeDowntime(isTriggered, check) {
  const header = `${check.name} is ${isTriggered ? 'DOWN' : 'back up'}`
  return isTriggered ? `${header} (${describeCheckAction(check)})` : header
}

function describeAlert(isTriggered, alert, check) {
  const checkDesc = isTriggered ? `${check.name} (${describeCheckAction(check)})` : check.name
  return `${alert.type} ${checkDesc}`
}

function describeCheckAction(check) {
  return `${check.method} ${check.protocol}://${check.url}`
}

const TG_ESCAPE_RE = /[_\*\[\]\(\)~`>#+\-=\|{}\.!]/g

function tgEscape(text) {
  return text.replace(TG_ESCAPE_RE, '\\$&')
}
