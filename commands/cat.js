/** 
 * SuperThomate
 * Test a random command
 **/
const snekfetch = require("snekfetch");
exports.run = (client, message, args) => {
  snekfetch
    .get("https://api.thecatapi.com/v1/images/search?api_key=41803418-dd31-45a3-b5c0-96cc3c7d14d5")
    .then ((response) => {
      message.channel.send({content: response.body [0].url}).catch(console.error);
      //console.log (response.body [0])
    })
    .catch(console.error);
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["meow", "miaou"],
  permLevel: "Moderator"
};

exports.help = {
  name: "cat",
  category: "Miscelaneous",
  description: "It gives you a cat picture at random.",
  usage: "cat"
};