exports.run = async (client, message, [key, ...user], level) => { // eslint-disable-line no-unused-vars
  var member = null ;
  if (key != "list") {
    if (user.length === 0) return message.reply (`enter a user.`) ;
    const userJoin = user.join (' ') ;
    member = message.guild.members.cache.find (u => u.id === userJoin || u.displayName === userJoin || u.user.tag === userJoin) ;
    if (typeof member === "undefined" || member === null) return message.reply (`${userJoin} is not a valid a user.`) ;
  }
  if (key === "ban" || key === "tki") {
    try {
      const [rows,fields] = await client.connection.promise().execute ("insert into wanshitong.blacklist (user_id, guild_id) values (?, ?) on duplicate key update guild_id=guild_id;", [member.id, message.guild.id]) ;
      message.reply (`${member.displayName} (${member.user.tag}) is now banned from the game !`) ;
    } catch (err) {
      console.log ("err ban:", err) ;
      message.reply("an error occured.") ;
    }
  } else 
  if (key === "unban") {
    try {
      const [rows,fields] = await client.connection.promise().execute ("delete from wanshitong.blacklist where user_id=? and guild_id=? ;", [member.id, message.guild.id]) ;
      message.reply (`${member.displayName} (${member.user.tag}) is now unbanned from the game !`)
    } catch (err) {
      console.log ("err unban:", err) ;
      message.reply("an error occured.") ;
    }
  } else 
  if (key === "status") {
    try {
      const [rows,fields] = await client.connection.promise().execute ("select count(*) as total from wanshitong.blacklist where user_id=? and guild_id=? ;", [member.id, message.guild.id]) ;
      message.reply (`${member.displayName} (${member.user.tag}) is ${rows[0].total?"":"NOT "}ban from the game !`)
    } catch (err) {
      console.log ("err list:", err) ;
      message.reply("an error occured.") ;
    }
  } else
  if (key === "list") {
    try {
      const [rows,fields] = await client.connection.promise().execute ("select user_id, guild_id from wanshitong.blacklist where guild_id=? ;", [message.guild.id]) ;
      let listBanned = "" ;
      rows.forEach(row => {
        const member = message.guild.members.cache.find (u => u.id === row.user_id) ;
        listBanned += `${member.displayName} (${member.user.tag})\n` ;
      }) ;
      message.channel.send (`= Blacklist =\n${listBanned}`, {code: "asciidoc"}) ;
    } catch (err) {
      console.log ("err list:", err) ;
      message.reply("an error occured.") ;
    }
  } else {
    message.reply (`${key} is not a valid key: ban, unban, status or list`)
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
  usage: "gameban <ban/unban/status/list> <user>"
};
