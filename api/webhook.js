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
    const text = formatMessage(req.body)
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

function formatMessage(data) {
  const state = data.state == 'triggered' ? '*New alert*' : 'Resolved'
  const {alert, check} = data
  const alertType = String(alert.type).toUpperCase()
  const alertName = `${check.name} (${check.method} ${check.protocol}://${check.url})`
  return `${state}: ${alertType} ${alertName}`
}
