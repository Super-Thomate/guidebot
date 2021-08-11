const csvParser = require("csv-parser");

exports.run = async (client, message, [action, id, ...value], level) => { // eslint-disable-line no-unused-vars
  // Retrieve current guild settings (merged) and overrides only
  const settings = message.settings;
  const defaults = client.settings.get("default");
  const guild_id = message.guild.id ;
  const overrides = client.settings.get(guild_id);
  if (!client.settings.has(guild_id)) client.settings.set(guild_id, {});
  
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
      var [rows, fields] = await client.connection.promise().query("select A.id as characterId, A.serie as characterSerie, A.name as characterName, A.rarity as characterRarity, A.image, B.id as itemId, B.name as itemName, B.rarity as itemRarity from `character` as A, `item` as B where A.id=B.character_id and A.id=? ;", [id]) ;
      if (! rows.length) return message.reply (`No character with id ${id}.`) ;
      // Is available
      var [rowsA, fields] = await client.connection.promise().query("select is_available from `availability` where character_id=? ;", [id]) ;
      // console.log (rowsA) ;
      var characterEmbed = new client.Discord.MessageEmbed()
                             .setColor("#DDA624")
                             .setTitle(`${rowsA.length && rowsA [0].is_available ? ":white_check_mark:":":x:"} ${rows [0].characterName} [${client.getRarityCharacter (rows[0].characterRarity)}]`)
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
  } else

  if (action === "load") {
    // user must specify a serie
    if (!id) return message.reply("Please specify a serie to load.");
    serie = id.toLowerCase() ;
    try {
      var [rows, fields] = await client.connection.promise().query("select A.id from `character` as A where A.serie=? ;", [serie]) ;
      if (! rows.length) return message.reply (`Serie ${serie} not found.`) ;
      await client.connection.promise().query ("START TRANSACTION;") ;
      var select = "insert into \`availability\` (is_available, character_id, guild_id) values" ;
      for (let i=0; i<rows.length; i++) {
        const character = rows [i] ;
        select += `${i!=0?',':''} (1,${character.id},${guild_id})` ;
      }
      select += " on duplicate key update is_available=1;" ;
      await client.connection.promise().execute (select) ;
      console.log ("No error detected => commit change") ;
      client.connection.execute ("COMMIT;") ;
    } catch (err) {
      console.error ("error on game load serie", err) ;
      message.reply ("An error occured.") ;
      console.log ("Error detected => rollback change") ;
      client.connection.execute ("ROLLBACK;") ;
    }
  } else

  if (action === "unload") {
    // user must specify a serie
    if (!id) return message.reply("Please specify a serie to unload.");
    serie = id.toLowerCase() ;
    try {
      var [rows, fields] = await client.connection.promise().query("select A.id from `character` as A where A.serie=? ;", [serie]) ;
      if (! rows.length) return message.reply (`Serie ${serie} not found.`) ;
      await client.connection.promise().query ("START TRANSACTION;") ;
      var select = "insert into \`availability\` (is_available, character_id, guild_id) values" ;
      for (let i=0; i<rows.length; i++) {
        const character = rows [i] ;
        select += `${i!=0?',':''} (0,${character.id},${guild_id})` ;
      }
      select += " on duplicate key update is_available=0;" ;
      await client.connection.promise().execute (select) ;
      console.log ("No error detected => commit change") ;
      client.connection.execute ("COMMIT;") ;
    } catch (err) {
      console.error ("error on game unload serie", err) ;
      message.reply ("An error occured.") ;
      console.log ("Error detected => rollback change") ;
      client.connection.execute ("ROLLBACK;") ;
    }
  } else

  if (action === "list") {
    // list all series or all character from a specific serie
    if (!id) {
      // list all series
      try {
        var [rows, fields] = await client.connection.promise().query("select distinct A.serie from `character` as A ;") ;
        if (! rows.length) return message.reply (`No serie found O.o.`) ;
        //console.log (rows) ;
        var characterEmbed = new client.Discord.MessageEmbed()
                               .setColor("#DDA624")
                               .setTitle(`All series`)
                               ;
        rows.forEach(row => {
          characterEmbed.setDescription ((characterEmbed.description ? characterEmbed.description : '')+`**${row.serie}**\n`)
        }) ;
        message.channel.send (characterEmbed) ;
      } catch (err) {
        console.error ("error on game list serie", err) ;
        message.reply (`an error occured while listing all character from ${serie}.`) ;
      }
    } else {
      // list all character from serie
      serie = id.toLowerCase() ;
      try {
        var [rows, fields] = await client.connection.promise().query("select A.id, A.name, A.rarity from `character` as A where A.serie=? ;", [serie]) ;
        if (! rows.length) return message.reply (`Serie ${serie} not found.`) ;
        console.log (rows) ;
        var characterEmbed = new client.Discord.MessageEmbed()
                               .setColor("#DDA624")
                               .setTitle(`Characters from ${serie}`)
                               ;
        rows.forEach(row => {
          characterEmbed.setDescription ((characterEmbed.description ? characterEmbed.description : '')+`#${row.id} **${row.name}** [${client.getRarityCharacter (row.rarity)}]\n`)
        }) ;
        message.channel.send (characterEmbed) ;
      } catch (err) {
        console.error ("error on game list serie", err) ;
        message.reply (`an error occured while listing all character from ${serie}.`) ;
      }
    }
  } else
  
  {
    message.reply (`${action} is not a valid action [editCharacter,editItem,show,load].`) ;
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
