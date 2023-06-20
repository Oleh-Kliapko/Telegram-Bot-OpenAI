const { Telegraf, session } = require("telegraf");
require("dotenv").config();

const INITIAL_SESSION = {
  messages: [],
};

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.launch(); // launch our bot

bot.use(session()); // set sessions in our bot to be able to ask many questions within one request

// launch when new user connected  - writes '/start'
bot.command("start", async (context) => {
  context.session = INITIAL_SESSION;
  await context.reply(
    "Hello. Ask me something in a voice or text and I will answer you immediately because I use AI ChatGPT :)"
  );
});

// launch new session when user starts new session - writes '/new'
bot.command("new", async (context) => {
  context.session = INITIAL_SESSION;
  await context.reply("Waiting your new voice or text message...");
});

module.exports = { bot, INITIAL_SESSION };
