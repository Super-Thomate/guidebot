exports.run = async (client, message, [action, ...args], level) => { // eslint-disable-line no-unused-vars
  /**/
  const settings = message.settings = client.getSettings(message.guild);
  /**/
  if (action === "allItems") {
    try {
      const guild_id = message.guild.id, owner_id = message.author.id ;
      var [rows, fields] = await client.connection.promise().query ("select id as characterId from wanshitong.`character` where guild_id=? and is_available=1 and rarity<>4 ;", [guild_id]) ;
      rows.forEach (async (row) => {
        let [rowsI, fieldsI] = await client.connection.promise().query ("select id as itemId from wanshitong.item where guild_id=? and character_id=? ;", [guild_id, row.characterId]) ;
        rowsI.forEach (rowI => {
          client.connection.execute ("insert into wanshitong.inventory (owner_id, item_id, guild_id) values (?, ?, ?) on duplicate key update item_id=item_id ;", [owner_id, rowI.itemId, guild_id], (err, res, fields) => {
            if (err) console.error (err) ;
            // console.log (res) ;
          })
        })
      }) ;
      var [rows, fields] = await client.connection.promise().query ("select id as characterId from wanshitong.`character` where guild_id=? and rarity=4 ;", [guild_id]) ;
      rows.forEach (async (row) => {
        let [rowsI, fieldsI] = await client.connection.promise().query ("select id as itemId from wanshitong.item where guild_id=? and character_id=? ;", [guild_id, row.characterId]) ;
        rowsI.forEach (rowI => {
          client.connection.execute ("insert into wanshitong.inventory_event (owner_id, item_id, guild_id) values (?, ?, ?) on duplicate key update item_id=item_id ;", [owner_id, rowI.itemId, guild_id], (err, res, fields) => {
            if (err) console.error (err) ;
            // console.log (res) ;
          })
        })
      }) ;
      message.reply (`all items given to ${message.member.displayName}.`) ;
    } catch (err) {
      console.log ("err give allItems:", err) ;
      message.reply ("an error occured !") ;
    }
  } else
  
  if (action === "character") {
    const allRarity = ["high","regular","low","event"] ;
    const rarity = args.join (' ').toLowerCase() ;
    if (! allRarity.includes (rarity)) return message.reply(`${rarity} is not valid [${allRarity}].`) ;
    client.dropCharacter (message.channel, message.settings, client.getRarityFromName (rarity)) ;
  } else 
  
  if (action === "characterId") {
    const id = args.join (' ').toLowerCase() ;
    if (!id) return message.reply ('specify an id.') ;
    client.dropCharacter (message.channel, message.settings, null, id) ;
  } else {
    try {
      const guildConf = client.settings.get (message.guild.id) ;
      await client.dropCharacter (message.channel, settings) ;
    } catch (err) {
      console.log ("err give:", err) ;
      message.reply ("an error occured !") ;
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["gimme"],
  permLevel: "Moderator"
};

exports.help = {
  name: "give",
  category: "Game",
  description: `give => spawn a random character
give allItems => give all items
give character <rarity> => give a random character of selected rarity
give characterId <id> => give character of selected id
  `,
  usage: "give <allItems/character/characterId> [rarity/id]"
};
