# Apex Ping Telegram Webhook

This repo contains a Vercel lambda function that receives alert POST requests sent by the Apex Ping
service, formats them into a human-readable messages, and asks a Telegram bot to post them to a chat
with the specified ID.

## How to use

Ask https://t.me/@BotFather to create a new bot. Securely store its token somewhere, it will be
referred later as `<bot_token>`.

Now, create a new Telegram channel. Add the bot you've just created to the channel's admin list,
granting the message sending privilege (and only it).

Now, we need to get the channel ID. Send this request:

```
curl -i -X GET 'https://api.telegram.org/bot<bot_token>/getUpdates'
```

Write down the value of `result[0].my_chat_member.chat.id` field of the resulting JSON. This is
the ID of the chat you've created, we'll refer to it as `<chat_id>`.

Generate a random access token that you'll use to restrict access to the lambda function. It will
be referred as `<lambda_auth_token>`.

Clone this repo and deploy a Vercel app from your clone, setting these environment variables:

* `BOT_TOKEN` to `<bot_token>`
* `CHAT_ID` to `<chat_id>`
* `AUTH_TOKEN` to `<lambda_auth_token>`

Now, go to your Apex Ping alerts configuration and add a Webhook alert with the URL of your Vercel
lambda with the path set to `api/webhook` and the `token` query field set to `<lambda_auth_token>`,
for example:

```
https://my-apex-ping-webhook.vercel.app/api/webhook?token=topsecret
```

You're all set!
