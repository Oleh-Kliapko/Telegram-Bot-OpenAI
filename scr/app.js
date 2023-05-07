const { message } = require("telegraf/filters");
const { code } = require("telegraf/format");

const { oggToMp3, streamToText } = require("./convertVoice");
const { bot, INITIAL_SESSION } = require("./models");

// the bot processes voice requests
bot.on(message("voice"), async (context) => {
  context.session ??= INITIAL_SESSION; // if session is null or undefined set up initial variable

  try {
    await context.reply(code("Request accepted. Wait for a reply..."));

    const { file_id } = context.message.voice;
    const urlFile = await context.telegram.getFileLink(file_id); // get URL-object of our stream file from Telegram storage

    const userId = context.from.id.toString(); // use user's IDs as a name of stream file .ogg

    const oggPath = await oggToMp3.createOgg(urlFile.href, userId); // create .ogg stream file from URL-object

    const mp3Path = await oggToMp3.convertToMp3(oggPath, userId); // convert .ogg to .mp3

    const text = await streamToText.transcription(mp3Path); // convert stream to text
    await context.reply(`Your request: ${text}`);
    await context.reply(code("Request is processing..."));

    const { messages } = context.session;
    messages.push({ role: streamToText.roles.USER, content: text }); // add new message to current session
    const { content } = await streamToText.chat(messages); // send text to chatGPT with certain role
    messages.push({ role: streamToText.roles.ASSISTANT, content }); // add new message to current session

    await context.reply(content); // show an answer for user
  } catch (error) {
    console.log("Other error", error.message);
  }
});

// the bot processes text requests
bot.on(message("text"), async (context) => {
  context.session ??= INITIAL_SESSION;
  const { text } = context.message;

  try {
    await context.reply(code("Request is processing..."));

    const { messages } = context.session;
    messages.push({
      role: streamToText.roles.USER,
      content: text,
    });
    const { content } = await streamToText.chat(messages);
    messages.push({ role: streamToText.roles.ASSISTANT, content });

    await context.reply(content);
  } catch (error) {
    console.log("Other error", error.message);
  }
});

process.once("SIGINT", () => {
  bot.stop("SIGINT");
  console.log("Bot was stopped!");
});

process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  console.log("Bot was stopped!");
});
