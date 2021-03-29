exports.run = async (client, message, [...user], level) => { // eslint-disable-line no-unused-vars
  const userJoin = user.join (' ') ;
  const member = message.guild.members.cache.find (u => u.id === userJoin || u.displayName === userJoin || (userJoin.match(/^<@!?(\d+)>$/) && u.id === userJoin.match(/^<@!?(\d+)>$/)[1]) || u.user.tag === userJoin || u.user.username === userJoin ) ;
  if (user.length) {
    if (typeof member === "undefined" || member === null) return message.reply (`${userJoin} is not a valid a user.`) ;
    try {
      await client.connection.promise().execute ("delete from wanshitong.inventory where owner_id=? and guild_id=? ;", [member.id, message.guild.id]) ;
      await client.connection.promise().execute ("delete from wanshitong.inventory_event where owner_id=? and guild_id=? ;", [member.id, message.guild.id]) ;
      await client.connection.promise().execute ("delete from wanshitong.gamelb where user_id=? and guild_id=? ;", [member.id, message.guild.id]) ;
      message.reply (`je supprime les datas de l'user ${userJoin} (${member.user.tag})`) ;
    } catch (err) {
      console.error ("err clear for user:", err) ;
      message.reply (`an error occured.`) ;
    }
  } else {
    try {
      await client.connection.promise().execute ("delete from wanshitong.inventory where guild_id=? ;", [message.guild.id]) ;
      await client.connection.promise().execute ("delete from wanshitong.inventory_event where guild_id=? ;", [message.guild.id]) ;
      await client.connection.promise().execute ("delete from wanshitong.gamelb where guild_id=? ;", [message.guild.id]) ;
      message.reply ("je supprime les datas de tout les users") ;
    } catch (err) {
      console.error ("err clear for all users:", err) ;
      message.reply (`an error occured.`) ;
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["gc"],
  permLevel: "Moderator"
};

exports.help = {
  name: "gameclear",
  category: "Game Settings",
  description: "Clear one or all users data.",
  usage: "gameclear [<user>]"
};
