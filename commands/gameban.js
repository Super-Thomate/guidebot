const { Formatters } = require("discord.js");

exports.run = async (client, message, [action, type, ...user], level) => { // eslint-disable-line no-unused-vars
  var member = null ;
  const allTypes = ["game", "magic"] ;
  if (! allTypes.includes (type)) return message.reply ({content: `${type} is not valid. Must be ${allTypes}.`}) ;
  if (action != "list") {
    if (user.length === 0) return message.reply ({content: `enter a user.`}) ;
    const userJoin = user.join (' ') ;
    member = message.guild.members.cache.find (u => u.id === userJoin || u.displayName === userJoin || u.user.tag === userJoin) ;
    if (typeof member === "undefined" || member === null) return message.reply ({content: `${userJoin} is not a valid a user.`}) ;
  }
  if (action === "ban" || action === "tki") {
    try {
      const [rows,fields] = await client.connection.promise().execute ("insert into wanshitong.blacklist (user_id, guild_id, type) values (?, ?,?) on duplicate key update guild_id=guild_id;", [member.id, message.guild.id, type]) ;
      message.reply ({content: `${member.displayName} (${member.user.tag}) is now banned from ${type} !`}) ;
    } catch (err) {
      console.log ("err ban:", err) ;
      message.reply({content: "an error occured on `gameban ban`."}) ;
    }
  } else 
  if (action === "unban") {
    try {
      const [rows,fields] = await client.connection.promise().execute ("delete from wanshitong.blacklist where user_id=? and guild_id=? and type=? ;", [member.id, message.guild.id,type]) ;
      message.reply ({content: `${member.displayName} (${member.user.tag}) is now unbanned from ${type} !`})
    } catch (err) {
      console.log ("err unban:", err) ;
      message.reply({content: "an error occured on `gameban unban`."}) ;
    }
  } else 
  if (action === "status") {
    try {
      const [rows,fields] = await client.connection.promise().execute ("select count(*) as total from wanshitong.blacklist where user_id=? and guild_id=? and type=? ;", [member.id, message.guild.id, type]) ;
      message.reply ({content: `${member.displayName} (${member.user.tag}) is ${rows[0].total?"":"NOT "}ban from ${type} !`})
    } catch (err) {
      console.log ("err list:", err) ;
      message.reply({content: "an error occured on `gameban status`."}) ;
    }
  } else
  if (action === "list") {
    try {
      const [rows,fields] = await client.connection.promise().execute ("select user_id, guild_id from wanshitong.blacklist where guild_id=? and type=?;", [message.guild.id, type]) ;
      let listBanned = "" ;
      rows.forEach(row => {
        const member = message.guild.members.cache.find (u => u.id === row.user_id) ;
        listBanned += `${member.displayName} (${member.user.tag})\n` ;
      }) ;
      message.channel.send ({content: Formatters.codeBlock("asciidoc", `= Blacklist ${type} =\n${listBanned}`)}) ;
    } catch (err) {
      console.log ("err list:", err) ;
      message.reply({content: "an error occured on `gameban list`."}) ;
    }
  } else {
    message.reply ({content: `${action} is not a valid action: ban, unban, status or list`})
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["gb", "gameboy", "ptdr", "blacklist"],
  permLevel: "Moderator"
};

exports.help = {
  name: "gameban",
  category: "Game Settings",
  description: "Blacklist a user so they cannot claim any item. Don't forget to unban...",
  usage: `gameban ban [game/magic] <user>    : add user to the blacklist for the game or the magic8ball (funny alias: ptdr tki)
gameban  unban [game/magic] <user> : remove user to the blacklist for the game or the magic8ball
gameban status [game/magic] <user> : check if user is on the blacklist for the game or the magic8ball
gameban list [game/magic]          : list all users on the blacklist for the game or the magic8ball
`
};
