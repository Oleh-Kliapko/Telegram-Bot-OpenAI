const { Configuration, OpenAIApi } = require("openai");
const { createReadStream } = require("fs");
require("dotenv").config();

class StreamToText {
  roles = {
    SYSTEM: "system",
    USER: "user",
    ASSISTANT: "assistant",
  };

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  // convert stream to text
  async transcription(filepath) {
    try {
      const res = await this.openai.createTranscription(
        createReadStream(filepath), // get file from path
        "whisper-1" // model of OpenAI which will be read our stream
      );

      return res.data.text;
    } catch (error) {
      console.log("Error during transcription to text", error.message);
    }
  }

  // send some request to chatGPT
  async chat(messages) {
    try {
      const res = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });

      return res.data.choices[0].message;
    } catch (error) {
      console.log("Error during connection with chatGPT", error.message);
    }
  }
}

const streamToText = new StreamToText();
module.exports = streamToText;
