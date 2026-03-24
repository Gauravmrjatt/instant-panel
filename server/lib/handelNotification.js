const myDetails = require("../myDetails.json");
const { Telegram } = require("telegraf");
const telegram = new Telegram(myDetails.token);
const Notification = (id, text) => {
  try {
    return telegram.sendMessage(id, text, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  } catch (error) {
    console.log("Notification  Error: ", error);
  }
};
function hideMiddleFourLetters(str) {
  if (str.length < 8) {
    return str; // Return the original string if it has less than 8 characters
  }

  const firstThree = str.slice(0, 3);
  const lastThree = str.slice(-3);
  const middleFour = "X".repeat(str.length - 6); // Replace the middle four letters with asterisks

  return firstThree + middleFour + lastThree;
}

module.exports = { Notification, hideMiddleFourLetters };
