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
    if (!id) return message.reply({content: "Please specify a characterId to edit."});
    message.reply ({content: "Do stuff"}) ;
  } else

  if (action === "editItem") {
    // User must specify an id.
    if (!id) return message.reply({content: "Please specify an itemId to edit."});
    message.reply ({content: "Do stuff"}) ;
  } else

  if (action === "show") {
    if (!id) return message.reply({content: "Please specify a characterId to show."});
    try {
      var [rows, fields] = await client.connection.promise().query("select A.id as characterId, A.name as characterName, A.rarity as characterRarity, A.image, B.id as itemId, B.name as itemName, B.rarity as itemRarity from `character` as A, `item` as B where A.id=B.character_id and A.id=? ;", [id]) ;
      if (! rows.length) return message.reply ({content: `No character with id ${id}.`}) ;
      //console.log (rows) ;
      var characterEmbed = new client.Discord.MessageEmbed()
                             .setColor("#DDA624")
                             //.setTitle(`${rows [0].is_available ? ":white_check_mark:":":x:"} ${rows [0].characterName} [${client.getRarityCharacter (rows[0].characterRarity)}]`)
                             .setTitle(`${rows [0].characterName} [${client.getRarityCharacter (rows[0].characterRarity)}]`)
                             .setImage(rows [0].image)
                             ;
      rows.forEach(row => {
        characterEmbed.addField (`${client.getRarityEmoji (row.itemRarity)} ${client.getRarityItem (row.itemRarity)}`, `#${row.itemId} ${row.itemName.upperCaseFirstLetter()}`)
      }) ;
      message.channel.send ({embeds: [characterEmbed]}) ;
    } catch (err) {
      console.error ("error on game show characterId", err) ;
      message.reply ({content: "error on game show characterId."}) ;
    }
  } else

  if (action === "load") {
    // user must specify a serie
    if (!id) return message.reply({content: "Please specify a serie to load."});
    serie = id.toLowerCase() ;
    try {
      var [rows, fields] = await client.connection.promise().query("select A.id from `character` as A where A.serie=? ;", [serie]) ;
      if (! rows.length) return message.reply ({content: `Serie ${serie} not found.`}) ;
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
      message.reply ({content: `${serie} loaded.`}) ;
    } catch (err) {
      console.error ("error on game load serie", err) ;
      message.reply ({content: "Error on `game load serie`."}) ;
      console.log ("Error detected => rollback change") ;
      client.connection.execute ("ROLLBACK;") ;
    }
  } else

  if (action === "unload") {
    // user must specify a serie
    if (!id) return message.reply({content: "Please specify a serie to unload."});
    serie = id.toLowerCase() ;
    try {
      var [rows, fields] = await client.connection.promise().query("select A.id from `character` as A where A.serie=? ;", [serie]) ;
      if (! rows.length) return message.reply ({content: `Serie ${serie} not found.`}) ;
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
      message.reply ({content: `${serie} unloaded.`}) ;
    } catch (err) {
      console.error ("error on game unload serie", err) ;
      message.reply ({content: "Error on `game unload serie`."}) ;
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
        if (! rows.length) return message.reply ({content: `No serie found O.o.`}) ;
        //console.log (rows) ;
        var characterEmbed = new client.Discord.MessageEmbed()
                               .setColor("#DDA624")
                               .setTitle(`All series`)
                               ;
        rows.forEach(row => {
          characterEmbed.setDescription ((characterEmbed.description ? characterEmbed.description : '')+`**${row.serie}**\n`)
        }) ;
        message.channel.send ({embeds: [characterEmbed]}) ;
      } catch (err) {
        console.error ("error on game list serie", err) ;
        message.reply ({content: `an error occured while listing all character from ${serie}.`}) ;
      }
    } else {
      // list all character from serie
      serie = id.toLowerCase() ;
      try {
        var [rows, fields] = await client.connection.promise().query("select A.id, A.name, A.rarity from `character` as A where A.serie=? ;", [serie]) ;
        if (! rows.length) return message.reply ({content: `Serie ${serie} not found.`}) ;
        var characterEmbed = new client.Discord.MessageEmbed()
                               .setColor("#DDA624")
                               .setTitle(`Characters from ${serie}`)
                               ;
        rows.forEach(row => {
          characterEmbed.setDescription ((characterEmbed.description ? characterEmbed.description : '')+`#${row.id} **${row.name}** [${client.getRarityCharacter (row.rarity)}]\n`)
        }) ;
        message.channel.send ({embeds: [characterEmbed]}) ;
      } catch (err) {
        console.error ("error on game list serie", err) ;
        message.reply ({content: `an error occured while listing all character from ${serie}.`}) ;
      }
    }
  } else

  if (action === "maxitem") {
    // list maxItem for current guild
    message.channel.send ({content: `For guild ${guild_id} : ${client.maxItem [guild_id]}`}) ;
  } else
  
  if (["fixlb", "fixleaderboard", "fixdummy"].includes (action)) {
    // fix leaderboard
    message.reply ({content: `Updating leaderboard after error based on inventory.`}) ;
    var [rows, fields] = await client.connection.promise().query(`select count(A.item_id) as count, A.owner_id, A.guild_id from inventory as A where A.guild_id=${guild_id} group by owner_id ;`) ;
    // console.log (rows) ;
    rows.forEach (async (row) => {
      var complete = row.count >= client.maxItem [guild_id] ;
      client.connection.execute (`insert into gamelb (user_id, items, complete, date_completed, guild_id) values (${row.owner_id}, ${row.count}, ${complete?1:0}, ${complete?'NOW()':'NULL'}, ${guild_id}) on duplicate key update items=${row.count} ${complete?', complete=1, date_completed=NOW()':''};`) ;
    }) ;
  } else
  
  if (["fixevent", "fixe"].includes (action)) {
    // fix event character in classic inventory
    message.reply ({content: `Updating inventory and inventory_event after error based on inventory.`}) ;
    var [rows, fields] = await client.connection.promise().query(`select B.id from \`character\` as A, item as B where A.id=B.character_id and A.rarity=4 ;`) ;
    //console.log (rows.length)
    rows.forEach (async (row) => {
      var [rowsA, fieldsA] = await client.connection.promise().query(`select * from inventory as A where A.item_id=${row ['id']} ;`) ;
      //console.log (rowsA) ;
      //console.log (row['id']) ;
      rowsA.forEach (async (rowA) => {
        //console.log (rowA) ;
        client.connection.execute (`delete from inventory where owner_id=${rowA ['owner_id']} and item_id=${rowA ['item_id']} and guild_id=${rowA ['guild_id']}`) ;
        client.connection.execute (`insert into inventory_event (owner_id, item_id, guild_id) values (${rowA ['owner_id']}, ${rowA ['item_id']}, ${rowA ['guild_id']}) on duplicate key update item_id=item_id;`) ;
      }) ;
    }) ;
  } else
  
  {
    message.reply ({content: `${action} is not a valid action [editCharacter,editItem,show,load,unload,list,maxitem,fixlb,fixevent].`}) ;
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
  description: "View or change information for a character or an item, or load/unload a serie, or show some infos about the current game.",
  usage: "game <editCharacter/editItem/show> <characterId/itemId>\ngame <load/unload/list> <serie>\ngame fixlb\ngame maxitem"
};
