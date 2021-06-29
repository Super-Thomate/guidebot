exports.run = async (client, message, [action, ...args], level) => { // eslint-disable-line no-unused-vars
    /*
     * Remove command
     * /remove all [<user>] => remove all items to user or oneself if no user is defined (add confirmation)
     * /remove event [<user>] => remove all event items to user or oneself if no user is defined (add confirmation)
     * /remove from <characterId> <itemRarity> [<user>] => remove item of rarity itemRarity from character characterId or all if itemRarity is 'all' to user or oneself if no user is defined
     */
    const settings = message.settings = client.getSettings(message.guild);
    var user = '' ;
    action = action.toLowerCase() ;
    if (action != 'from') {
      var userJoin = args.join (' ') ;  
      user = (! userJoin) ? message.member : getUser (message, userJoin) ;  
    } else {
      characterId = args [0] ;
      itemRarity = args [1].toLowerCase() ;
      var userJoin = args.slice(2).join (' ') ;  
      user = (! userJoin) ? message.member : getUser (message, userJoin) ;  
    }
    const allItemRarity = ["common", "uncommon", "rare", "epic"] ;
  
    if (action === "all" || action === "event") {
      const table = "inventory"+(action === "event" ? "_event" : "") ;
      try {
        const guild_id = message.guild.id, owner_id = user.id ;
        const response = await client.awaitReply(message, `Are you sure you want to remove all items from **${user.displayName}** ? (Y/N)`);
        // CREATE TABLE IF NOT EXISTS `gamelb` (`user_id` BIGINT NOT NULL, `items` INT NOT NULL, `complete` SMALLINT NOT NULL DEFAULT 0, `date_completed` DATETIME NULL, `guild_id` BIGINT NOT NULL, primary key (`user_id`, `guild_id`)) ;
        if (["y", "yes"].includes(response.toLowerCase())) {
          var [rows, fields] = await client.connection.promise().query (`delete from wanshitong.${table} where owner_id=? and guild_id=? ;`, [owner_id, guild_id]) ;
          if (action === "all")
            var [rowsL, fields] = await client.connection.promise().query (`update wanshitong.gamelb set items=0, complete=0, date_completed=NULL where user_id=? and guild_id=? ;`, [owner_id, guild_id]) ;
          message.reply (`remove all items from  ${user.displayName}.`) ;
        } else {
          message.reply (`remove all aborted.`) ;
        }
      } catch (err) {
        console.log ("err remove all:", err) ;
        message.reply ("an error occured !") ;
      }
    } else
  
    if (action === "from") {
      try {
        // message.reply (`should give item of rarity ${itemRarity} from character ${characterId} to ${user.displayName}.`) ;
        const guild_id = message.guild.id, owner_id = user.id ;
        var [rows, fields] = await client.connection.promise().query ("select rarity as characterRarity, name as characterName from wanshitong.`character` where id=? ;", [characterId]) ;
        if (! rows.length) return message.reply (`id ${characterId} is not a valid id !`) ;
        rows.forEach (async (row) => {
          isEvent = (row ['characterRarity'] === 4) ;
          characterName = row ['characterName'] ;
        }) ;
        if (allItemRarity.includes (itemRarity)) {
          [rowsI, fieldsI] = await client.connection.promise().query ("select id as itemId from wanshitong.item where character_id=? and rarity=?;", [characterId, client.getItemRarityFromName (itemRarity)]) ;
        } else 
        if (itemRarity === "all") {
          [rowsI, fieldsI] = await client.connection.promise().query ("select id as itemId from wanshitong.item where character_id=? ;", [characterId]) ;
        } else 
        {
          return message.reply (`rarity ${itemRarity} is not valid !`) ;
        }
        const table = `inventory${(isEvent ? "_event" : "")}` ;
        const response = await client.awaitReply(message, `Are you sure you want to remove items from **${user.displayName}** ? (Y/N)`);
        if (["y", "yes"].includes(response.toLowerCase())) {
          rowsI.forEach (rowI => {
            client.connection.query (`delete from wanshitong.${table} where owner_id=? and item_id=? and guild_id=? ;`, [owner_id, rowI.itemId, guild_id], (err, res, fields) => {
              if (err) console.error (err) ;
              // console.log (res) ;
            }) ;
            if (! isEvent) {
              client.connection.query (`update wanshitong.gamelb set items=items-1, complete=0, date_completed=NULL where user_id=? and guild_id=? ;`, [owner_id, guild_id], (err, res, fields) => {
                if (err) console.error (err) ;
                //console.log (res) ;
              }) ;
            }
          }) ;
          message.reply (`remove ${itemRarity === "all" ? "all items" : "item of rarity "+itemRarity} from ${characterName} from ${user.displayName}.`) ;
        } else {
          message.reply (`remove aborted.`) ;
        }
      } catch (err) {
        console.log ("err give allItems:", err) ;
        message.reply ("an error occured !") ;
      }
    } else
  
    {
      message.reply (`invalid action \`${action}\`.`) ;
    }
  };
  
  exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["rm"],
    permLevel: "Moderator"
  };
  
  exports.help = {
    name: "remove",
    category: "Game",
    description: `Remove items from a user.`,
    usage: 
    `remove all [<user>]        => remove all items from user or oneself if no user is defined
          remove event [<user>]      => give all items from event character from user or oneself if no user is defined
          remove from <characterId> <itemRarity> [<user>] => remove item of rarity itemRarity from character characterId or all if itemRarity is 'all' from user or oneself if no user is defined`
  };
  
  getUser = (message, userJoin) => {
    return message.guild.members.cache.find (u => u.id === userJoin || u.displayName === userJoin || (userJoin.match(/^<@!?(\d+)>$/) && u.id === userJoin.match(/^<@!?(\d+)>$/)[1]) || u.user.tag === userJoin || u.user.username === userJoin ) ;
  }