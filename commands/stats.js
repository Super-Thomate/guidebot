const { version, Formatters } = require("discord.js");
const moment = require("moment");
require("moment-duration-format");

exports.run = (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
  const guild_id = message.guilds.id ;
  message.channel.send({content: Formatters.codeBlock("asciidoc", `= STATISTICS =
  • Mem Usage  :: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
  • Uptime     :: ${duration}
  • Users      :: ${client.users.cache.size.toLocaleString()}
  • Servers    :: ${client.guilds.cache.size.toLocaleString()}
  • Channels   :: ${client.channels.cache.size.toLocaleString()}
  • Discord.js :: v${version}
  • Node       :: ${process.version}
  • Items      :: ${client.maxItem [guild_id]}`)});
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Moderator"
};

exports.help = {
  name: "stats",
  category: "Miscelaneous",
  description: "Gives some useful bot statistics",
  usage: "stats"
};
