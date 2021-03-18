exports.run = async (client, message, [key, ...args], level) => { // eslint-disable-line no-unused-vars
  /**/
  if (!client.settings.has(message.guild.id)) client.settings.set(message.guild.id, {});
  const keys = [
    "occuranceDrop",
    "toggleCommandTrigger",
    "dropChannel",
    "claimTime",
    "characterRate",
    "itemRate",
    "commandClaim"
  ] ;
  const defaults = client.settings.get("default");
  const overrides = client.settings.get(message.guild.id);
  keys.forEach((key) => {
    if (! overrides[key]) client.settings.set(message.guild.id, defaults[key], key);
  }) ;
  /**/
  if (key === "allItems") {
    const guild_id = message.guild.id, owner_id = message.author.id ;
    var [rows, fields] = await client.connection.promise().query ("select id as characterId from wanshitong.`character` where guild_id=? and is_available=1;", [guild_id]) ;
    rows.forEach (async (row) => {
      let [rowsI, fieldsI] = await client.connection.promise().query ("select id as itemId from wanshitong.item where guild_id=? and character_id=? ;", [guild_id, row.characterId]) ;
      rowsI.forEach (rowI => {
        client.connection.execute ("insert into wanshitong.inventory (owner_id, item_id, guild_id) values (?, ?, ?) on duplicate key update item_id=item_id ;", [owner_id, rowI.itemId, guild_id], (err, res, fields) => {
          console.error (err) ; console.log (res) ;
        })
      })
    }) ;
    
  } else {
    const guildConf = client.settings.get (message.guild.id) ;
    await client.dropCharacter (message.channel, guildConf) ;
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["give"],
  permLevel: "Moderator"
};

exports.help = {
  name: "gimme",
  category: "Game",
  description: "Give a random character with a random item. Only for debug/test !",
  usage: "gimme"
};
