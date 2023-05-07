const { unlink } = require("fs/promises");

const removeStreams = async (path) => {
  try {
    await unlink(path);
  } catch (error) {
    console.log("Error during deleting stream", error.message);
  }
};

module.exports = removeStreams;
