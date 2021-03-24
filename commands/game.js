exports.run = async (client, message, [action, id, ...value], level) => { // eslint-disable-line no-unused-vars
  // Retrieve current guild settings (merged) and overrides only
  const settings = message.settings;
  const defaults = client.settings.get("default");
  const overrides = client.settings.get(message.guild.id);
  if (!client.settings.has(message.guild.id)) client.settings.set(message.guild.id, {});
  
  // Edit an existing character
  if (action === "editCharacter") {
    // User must specify an id.
    if (!id) return message.reply("Please specify a characterId to edit.");
    message.reply ("Do stuff") ;
  } else
  if (action === "editItem") {
    // User must specify an id.
    if (!id) return message.reply("Please specify an itemId to edit.");
    message.reply ("Do stuff") ;
  } else
  if (action === "show") {
    if (!id) return message.reply("Please specify a characterId to show.");
    try {
      var [rows, fields] = await client.connection.promise().query("select A.id as characterId, A.name as characterName, A.image, A.is_available, B.id as itemId, B.name as itemName, B.rarity as itemRarity from `character` as A, `item` as B where A.id=B.character_id and A.id=? ;", [id]) ;
      if (! rows.length) return message.reply (`No character with id ${id}.`) ;
      //console.log (rows) ;
      var characterEmbed = new client.Discord.MessageEmbed()
                             .setColor("#DDA624")
                             .setTitle(`${rows [0].is_available ? ":white_check_mark:":":x:"} ${rows [0].characterName}`)
                             .setImage(rows [0].image)
                             ;
      rows.forEach(row => {
        characterEmbed.addField (`${client.getRarityEmoji (row.itemRarity)} ${client.getRarityItem (row.itemRarity)}`, `#${row.itemId} ${row.itemName.upperCaseFirstLetter()}`)
      }) ;
      message.channel.send (characterEmbed) ;
    } catch (err) {
      console.error ("error on game show characterId", err) ;
      message.reply ("An error occured.") ;
    }
  } else {
    message.reply (`${action} is not a valid action [editCharacter,editItem,show].`) ;
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "Moderator"
};

exports.help = {
  name: "game",
  category: "Game Settings",
  description: "View or change information for a character or an item.",
  usage: "game <editCharacter/editItem/show> <characterId/itemId>"
};
