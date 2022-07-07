require('dotenv').config();

const TeleBot = require('telebot');

let TOKEN = process.env.TOKEN_TELEGRAM;

const bot = new TeleBot({
    token: TOKEN,
});

let log = console.log;

let output = content => ({
    statusCode: 200,
    body: JSON.stringify(content)
});

let btn = bot.inlineButton;

module.exports = {
    log, 
    output,
    btn
}