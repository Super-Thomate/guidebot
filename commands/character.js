exports.run = async (client, message, [action, id, key, ...value], level) => { // eslint-disable-line no-unused-vars
  // Retrieve current guild settings (merged) and overrides only
  const settings = message.settings;
  const guild_id = message.guild.id ;
  const defaults = client.settings.get("default");
  const overrides = client.settings.get(guild_id);
  if (!client.settings.has(guild_id)) client.settings.set(guild_id, {});
  // Edit an existing character
  if (action === "edit") {
    // User must specify an id.
    if (!id) return message.reply("Please specify a characterId to edit.");
    if (!key) return message.reply ("Please specify a key to edit.") ;
    switch (key) {
      case 'available':
      case 'dispo':
        let is_available = value.join('').toLowerCase() === "true" ? 1 : 0 ;
        try {
          let insert = `insert into availability (character_id, guild_id, is_available) values (${id}, ${guild_id}, ${is_available}) on duplicate key update is_available=${is_available}` ;
          await client.connection.promise().execute (insert) ;
          return message.reply (`key is_available is now ${is_available}.`) ;
        } catch (err) {
          console.error ("err on edit character:", err) ;
          return message.reply (`Error on edit available for character ${id}.`) ;
        }
      break ;
      default:
        return message.reply (`Key ${key} is unknown.`)
    }
  } else
  if (action === "bulkedit") {
    // User must specify an id.
    const level = client.permlevel(message);
    if (level < 4) return ;
    if (!id) return message.reply("Please specify two characterId to edit (start-end).");
    let id_start_end = id.split('-') ;
    if (id_start_end.length !==2 ) return message.reply("Please specify two characterId to edit (start-end).")
    if (!key) return message.reply ("Please specify a key to edit.") ;
    switch (key) {
      case 'available':
      case 'dispo':
        let is_available = value.join('').toLowerCase() === "true" ? 1 : 0 ;
        try {
         await client.connection.promise().query("update `character` set is_available=? where id>=? and id<=? ;", [is_available, id_start_end[0], id_start_end[1]]) ;
         return message.reply (`key is_available is now ${is_available}.`)
        } catch (err) {
          console.error ("err on edit character:", err) ;
          return message.reply ("An error occured.")
        }
      break ;
      default:
        return message.reply (`Key ${key} is unknown.`)
    }
  }  else
  if (action === "show") {
    if (!id) return message.reply("Please specify a characterId to show.");
    try {
      var [rows, fields] = await client.connection.promise().query("select A.id as characterId, A.name as characterName, A.rarity as characterRarity, A.image, B.id as itemId, B.name as itemName, B.rarity as itemRarity from `character` as A, `item` as B where A.id=B.character_id and A.id=? ;", [id]) ;
      var [rowsA, fieldsA] = await client.connection.promise().query("select is_available from availability where character_id=? and guild_id=? ;", [id, guild_id]) ;
      if (! rows.length) return message.reply (`No character with id ${id}.`) ;
      let is_available = (rowsA.length && rowsA.is_available == 1) ;
      //console.log (rows) ;
      var characterEmbed = new client.Discord.MessageEmbed()
                             .setColor("#DDA624")
                             //.setTitle(`${is_available ? ":white_check_mark:":":x:"} ${rows [0].characterName} [${client.getRarityCharacter (rows[0].characterRarity)}]`)
                             .setTitle(`${is_available ? ":white_check_mark:":":x:"} ${rows [0].characterName} [${client.getRarityCharacter (rows[0].characterRarity)}]`)
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
    message.reply (`${action} is not a valid action [edit,show].`) ;
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "Moderator"
};

exports.help = {
  name: "character",
  category: "Game Settings",
  description: "View or change information for a character.",
  usage: "character <edit/show> <characterId>"
};
