import fetch from 'node-fetch'

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID

export default async (req, res) => {
  try {
    const text = formatMessage(req.body)
    await postUpdate(text)
    res.send('ok')
  } catch (err) {
    res.status(500).send(`error: ${err.stack}`)
  }
}

async function postUpdate(text) {
  const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({chat_id: CHAT_ID, text: text}),
  })
}

function formatMessage(data) {
  return JSON.stringify(data, null, '  ')
}
