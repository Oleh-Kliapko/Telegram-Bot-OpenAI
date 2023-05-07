const axios = require("axios");
const { createWriteStream } = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const installer = require("@ffmpeg-installer/ffmpeg");

const { removeStreams } = require("../helpers");

class OggToMp3 {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  async createOgg(inputUrlFile, outputFile) {
    try {
      // create path to temporary voice file .ogg
      const oggPath = path.join(
        __dirname,
        "../../",
        "tempVoices",
        `${outputFile}.ogg`
      );
      // get the URL of voice file that needs to download
      const res = await axios({
        method: "GET",
        url: inputUrlFile,
        responseType: "stream",
      });

      // save input file on our temporary folder
      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath); //create a writable stream to the file
        res.data.pipe(stream); //pass the response data to the file
        stream.on("finish", () => resolve(oggPath)); // close promise as resolved
      });
    } catch (error) {
      console.log("Error creating OGG file", error.message);
    }
  }

  convertToMp3(inputFile, outputFile) {
    try {
      // create path to the .mp3 file
      const mp3Path = path.join(
        __dirname,
        "../../",
        "tempVoices",
        `${outputFile}.mp3`
      );

      // convert .ogg to .mp3 format
      return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
          .inputOption("-t 60") //only the first 60 seconds of the input file will be processed
          .output(mp3Path)
          .on("end", () => {
            removeStreams(inputFile);
            resolve(mp3Path);
          })
          .on("error", (error) =>
            reject("Error during conversion:", error.message)
          )
          .run();
      });
    } catch (error) {
      console.log("Error during converting OGG to MP3", error.message);
    }
  }
}

const oggToMp3 = new OggToMp3();
module.exports = oggToMp3;
