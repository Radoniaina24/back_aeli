const mongoose = require("mongoose");
async function dbConnect() {
  try {
    const connected = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongodb connected ${(await connected).connection.host}`);
  } catch (error) {
    console.log(`Error ${error.message}`);
  }
}
module.exports = dbConnect;
