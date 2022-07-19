exports.run = async (client, message, [action, ...args], level) => { // eslint-disable-line no-unused-vars
  const author = message.author.id ;
  const maxPerPage = 20 ;
  const guild_id = message.guild.id ;
  if (action && action === "event") {
    var [rows, fields] = await client
                          .connection
                          .promise ()
                          .query ("select count(*) as total from `wanshitong`.`inventory_event` where owner_id=? and guild_id=?;", [author, guild_id]) ;
    const numPage = Math.ceil (rows[0].total / maxPerPage) || 1 ;
    //[rows, fields] = await client.connection.promise().query ("select A.`name` as characterName , B.`name` as itemName , B.`rarity` as itemRarity from `wanshitong`.`character` as A, `wanshitong`.`item` as B, `wanshitong`.`inventory` as C where C.`owner_id` = ? and B.`id` = C.`item_id` and  A.`id` = B.`character_id` order by A. name ;", [author]) ;
    //console.log (rows) ;
    var characterEmbed = new client.Discord.MessageEmbed()
                               .setColor("#DDA624")
                               .setTitle(`📜 Inventaire de ${message.member.displayName} 🎉`)
                               .setFooter (`1/${numPage}`)
                               ;
    var currentPage = 1 ;
    var allFields = await getInventoryEvent(client, author, currentPage, guild_id, maxPerPage) ;
    // display
    if (allFields.length) {
      characterEmbed.addFields (allFields) ;
      let inventory = await message.channel.send ({embeds: [characterEmbed]}) ;
      inventory.react('◀')
         .then()
         .catch(console.error);
      inventory.react('▶')
         .then()
         .catch(console.error);
      // Create a reaction collector
      const filter = (reaction, user) => (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && !user.bot;
      const collector = inventory.createReactionCollector({filter, time: 60000 });
      collector.on('collect', async (r) => {
        //console.log(`Collected ${r.emoji.name}`) ; 
        if (r.emoji.name === '◀') {
          currentPage-- ;
        } else {
         currentPage++ ;
        }
        // DELETE USER REACTION
        const userId = r.users.cache.filter (user => !user.bot).first().id ;
        const userReactions = r.message.reactions.cache.filter(reaction => reaction.users.cache.has(userId));
        try {
          for (const reaction of userReactions.values()) {
            await reaction.users.remove(userId);
          }
        } catch (error) {
        	console.error('Failed to remove reactions.');
        }
        // END DELETE USER REACTION
        if (currentPage <=0) currentPage = numPage ;
        if (currentPage > numPage) currentPage = 1 ;
        allFields = await getInventoryEvent (client, author, currentPage, guild_id, maxPerPage) ;
        characterEmbed.fields = [] ;
        characterEmbed.addFields (allFields) ;
        characterEmbed.setFooter (`${currentPage}/${numPage}`) ;
        inventory.edit (characterEmbed) ;
      });
      collector.on('end', collected => {
        //console.log(`Collected ${collected.size} items`) ;
        inventory.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
      });
      return ;
    } else {
      characterEmbed.setDescription ("Inventaire vide") ;
    }
  } else 
  if (action && action.length) {
    var [rows, fields] = await client
                          .connection
                          .promise ()
                          .query (`select * from \`character\` where serie=? ;`, [action]) ;
    
    if (! rows.length) {
      // No series for action
      return message.reply ({content: `No series found for ${action}.`}) ;
    }
    var [rowsC, fieldsC] = await client
                          .connection
                          .promise ()
                          .query ("select count(*) as total from `inventory` as A, `character` as B, item as C where A.item_id=C.id and C.character_id=B.id and B.serie=? and A.owner_id=? and A.guild_id=? ;", [action, author, guild_id]) ;
    const numPage = Math.ceil (rowsC[0].total / maxPerPage) || 1 ;
    var characterEmbed = new client.Discord.MessageEmbed()
                               .setColor("#DDA624")
                               .setTitle(`📜 Inventaire de ${message.member.displayName}`)
                               .setFooter (`1/${numPage}`)
                               ;
    var currentPage = 1 ;
    var allFields = await getInventoryByCharacterSerie(client, author, currentPage, guild_id, action, maxPerPage) ;
    // display
    if (allFields.length) {
      characterEmbed.addFields (allFields) ;
      let inventory = await message.channel.send ({embeds: [characterEmbed]}) ;
      inventory.react('◀')
         .then()
         .catch(console.error);
      inventory.react('▶')
         .then()
         .catch(console.error);
      // Create a reaction collector
      const filter = (reaction, user) => (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && !user.bot;
      const collector = inventory.createReactionCollector({filter, time: 60000 });
      collector.on('collect', async (r) => {
        //console.log(`Collected ${r.emoji.name}`) ; 
        if (r.emoji.name === '◀') {
          currentPage-- ;
        } else {
         currentPage++ ;
        }
        // DELETE USER REACTION
        const userId = r.users.cache.filter (user => !user.bot).first().id ;
        const userReactions = r.message.reactions.cache.filter(reaction => reaction.users.cache.has(userId));
        try {
          for (const reaction of userReactions.values()) {
            await reaction.users.remove(userId);
          }
        } catch (error) {
        	console.error('Failed to remove reactions.');
        }
        // END DELETE USER REACTION
        if (currentPage <=0) currentPage = numPage ;
        if (currentPage > numPage) currentPage = 1 ;
        allFields = await getInventoryByCharacterSerie(client, author, currentPage, guild_id, action, maxPerPage) ;
        characterEmbed.fields = [] ;
        characterEmbed.addFields (allFields) ;
        characterEmbed.setFooter (`${currentPage}/${numPage}`) ;
        inventory.edit (characterEmbed) ;
      });
      collector.on('end', collected => {
        //console.log(`Collected ${collected.size} items`) ;
        inventory.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
      });
      return ;
    } else {
      characterEmbed.setDescription ("Inventaire vide") ;
    }
  } else
  {
    var [rows, fields] = await client
                          .connection
                          .promise ()
                          .query ("select count(*) as total from `wanshitong`.`inventory` where owner_id=? and guild_id=?;", [author, guild_id]) ;
    const numPage = Math.ceil (rows[0].total / maxPerPage) || 1 ;
    //[rows, fields] = await client.connection.promise().query ("select A.`name` as characterName , B.`name` as itemName , B.`rarity` as itemRarity from `wanshitong`.`character` as A, `wanshitong`.`item` as B, `wanshitong`.`inventory` as C where C.`owner_id` = ? and B.`id` = C.`item_id` and  A.`id` = B.`character_id` order by A. name ;", [author]) ;
    //console.log (rows) ;
    var characterEmbed = new client.Discord.MessageEmbed()
                               .setColor("#DDA624")
                               .setTitle(`📜 Inventaire de ${message.member.displayName}`)
                               .setFooter (`1/${numPage}`)
                               ;
    var currentPage = 1 ;
    var allFields = await getInventory(client, author, currentPage, guild_id, maxPerPage) ;
    // display
    if (allFields.length) {
      characterEmbed.addFields (allFields) ;
      let inventory = await message.channel.send ({embeds: [characterEmbed]}) ;
      inventory.react('◀')
         .then()
         .catch(console.error);
      inventory.react('▶')
         .then()
         .catch(console.error);
      // Create a reaction collector
      const filter = (reaction, user) => (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && !user.bot;
      const collector = inventory.createReactionCollector({filter, time: 60000 });
      collector.on('collect', async (r) => {
        //console.log(`Collected ${r.emoji.name}`) ; 
        if (r.emoji.name === '◀') {
          currentPage-- ;
        } else {
         currentPage++ ;
        }
        // DELETE USER REACTION
        const userId = r.users.cache.filter (user => !user.bot).first().id ;
        const userReactions = r.message.reactions.cache.filter(reaction => reaction.users.cache.has(userId));
        try {
          for (const reaction of userReactions.values()) {
            await reaction.users.remove(userId);
          }
        } catch (error) {
        	console.error('Failed to remove reactions.');
        }
        // END DELETE USER REACTION
        if (currentPage <=0) currentPage = numPage ;
        if (currentPage > numPage) currentPage = 1 ;
        allFields = await getInventory(client, author, currentPage, guild_id, maxPerPage) ;
        characterEmbed.fields = [] ;
        characterEmbed.addFields (allFields) ;
        characterEmbed.setFooter (`${currentPage}/${numPage}`) ;
        inventory.edit (characterEmbed) ;
      });
      collector.on('end', collected => {
        //console.log(`Collected ${collected.size} items`) ;
        inventory.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
      });
      return ;
    } else {
      characterEmbed.setDescription ("Inventaire vide") ;
    }
  }
  return await message.channel.send ({embeds: [characterEmbed]}) ;
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["bag", "inv", "invent"],
  permLevel: "User"
};

exports.help = {
  name: "inventory",
  category: "Game",
  description: "Show your current inventory.",
  usage: "inventory [event]"
};


async function getInventory (client, author, currentPage, guild_id, maxPerPage = 20) {
  const limit = (currentPage-1)*maxPerPage ;
  const [rows, fields] = await client.connection.promise().query ("select A.`serie` as serie, A.`id` as characterId, A.`name` as characterName , B.`name` as itemName , B.`rarity` as itemRarity from `wanshitong`.`character` as A, `wanshitong`.`item` as B, `wanshitong`.`inventory` as C where C.`owner_id` = ? and B.`id` = C.`item_id` and  A.`id` = B.`character_id` and C.guild_id=? order by A.serie, A.name, A.id, B.rarity limit "+limit+","+maxPerPage+";", [author, guild_id]) ;
  //console.log (rows) ;
  let allFields = [] ;
  let currentCharacter = "" ;
  let currentSerie = "" ;
  let currentCharacterId = 0 ;
  let value = "" ;
  rows.forEach ((row) => {
    
    if (currentCharacterId != row.characterId) {
      if (currentCharacter.length) {
        allFields.push ({"name": currentCharacter, "value": value}) ;
      }
      //console.log ("allFields:", allFields) ;
      currentCharacter = row.characterName ;
      currentCharacterId = row.characterId ;
      value = "" ;
    }
    value += `${client.getRarityEmoji (row.itemRarity)} ${client.getRarityItem (row.itemRarity)} - ${row.itemName.upperCaseFirstLetter()}\n` ;
  }) ;
  // final round
  if (currentCharacter.length)
    allFields.push ({"name": currentCharacter, "value": value}) ;
  return allFields ;
}

async function getInventoryEvent (client, author, currentPage, guild_id, maxPerPage = 20) {
  const limit = (currentPage-1)*maxPerPage ;
  const [rows, fields] = await client.connection.promise().query ("select A.`serie` as serie, A.`id` as characterId, A.`name` as characterName , B.`name` as itemName , B.`rarity` as itemRarity from `wanshitong`.`character` as A, `wanshitong`.`item` as B, `wanshitong`.`inventory_event` as C where C.`owner_id` = ? and B.`id` = C.`item_id` and  A.`id` = B.`character_id` and C.guild_id=? order by A.serie, A.name, A.id, B.rarity limit "+limit+","+maxPerPage+";", [author, guild_id]) ;
  //console.log (rows) ;
  let allFields = [] ;
  let currentCharacter = "" ;
  let currentCharacterId = 0 ;
  let value = "" ;
  rows.forEach ((row) => {
    if (currentCharacterId != row.characterId) {
      if (currentCharacter.length) {
        allFields.push ({"name": currentCharacter, "value": value}) ;
      }
      //console.log ("allFields:", allFields) ;
      currentCharacter = row.characterName ;
      currentCharacterId = row.characterId ;
      value = "" ;
    }
    value += `${client.getRarityEmoji (row.itemRarity)} ${client.getRarityItem (row.itemRarity)} - ${row.itemName.upperCaseFirstLetter()}\n` ;
  }) ;
  // final round
  if (currentCharacter.length)
    allFields.push ({"name": currentCharacter, "value": value}) ;
  return allFields ;
}

async function getInventoryByCharacterId (client, author, currentPage, guild_id, characterId, maxPerPage = 20) {
  const limit = (currentPage-1)*maxPerPage ;
  const [rows, fields] = await client.connection.promise().query ("select A.`serie` as serie, A.`id` as characterId, A.`name` as characterName , B.`name` as itemName , B.`rarity` as itemRarity from `wanshitong`.`character` as A, `wanshitong`.`item` as B, `wanshitong`.`inventory` as C where C.`owner_id` = ? and B.`id` = C.`item_id` and  A.`id` = B.`character_id` and C.guild_id=? and A.id=? order by A.serie, A.name, A.id, B.rarity limit "+limit+","+maxPerPage+";", [author, guild_id, characterId]) ;
  //console.log (rows) ;
  let allFields = [] ;
  let currentCharacter = "" ;
  let currentSerie = "" ;
  let currentCharacterId = 0 ;
  let value = "" ;
  rows.forEach ((row) => {
    
    if (currentCharacterId != row.characterId) {
      if (currentCharacter.length) {
        allFields.push ({"name": currentCharacter, "value": value}) ;
      }
      //console.log ("allFields:", allFields) ;
      currentCharacter = row.characterName ;
      currentCharacterId = row.characterId ;
      value = "" ;
    }
    value += `${client.getRarityEmoji (row.itemRarity)} ${client.getRarityItem (row.itemRarity)} - ${row.itemName.upperCaseFirstLetter()}\n` ;
  }) ;
  // final round
  if (currentCharacter.length)
    allFields.push ({"name": currentCharacter, "value": value}) ;
  return allFields ;
}

async function getInventoryByCharacterSerie (client, author, currentPage, guild_id, characterSerie, maxPerPage = 20) {
  const limit = (currentPage-1)*maxPerPage ;
  const [rows, fields] = await client.connection.promise().query ("select A.`serie` as serie, A.`id` as characterId, A.`name` as characterName , B.`name` as itemName , B.`rarity` as itemRarity from `wanshitong`.`character` as A, `wanshitong`.`item` as B, `wanshitong`.`inventory` as C where C.`owner_id` = ? and B.`id` = C.`item_id` and  A.`id` = B.`character_id` and C.guild_id=? and A.serie=? order by A.serie, A.name, A.id, B.rarity limit "+limit+","+maxPerPage+";", [author, guild_id, characterSerie]) ;
  //console.log (rows) ;
  let allFields = [] ;
  let currentCharacter = "" ;
  let currentSerie = "" ;
  let currentCharacterId = 0 ;
  let value = "" ;
  rows.forEach ((row) => {
    
    if (currentCharacterId != row.characterId) {
      if (currentCharacter.length) {
        allFields.push ({"name": currentCharacter, "value": value}) ;
      }
      //console.log ("allFields:", allFields) ;
      currentCharacter = row.characterName ;
      currentCharacterId = row.characterId ;
      value = "" ;
    }
    value += `${client.getRarityEmoji (row.itemRarity)} ${client.getRarityItem (row.itemRarity)} - ${row.itemName.upperCaseFirstLetter()}\n` ;
  }) ;
  // final round
  if (currentCharacter.length)
    allFields.push ({"name": currentCharacter, "value": value}) ;
  return allFields ;
}