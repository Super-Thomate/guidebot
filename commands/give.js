exports.run = async (client, message, [action, ...args], level) => { // eslint-disable-line no-unused-vars
  /*
   * Give command
   * /give all [<user>] => give all items to user or oneself if no user is defined
   * /give from <characterId> <itemRarity> [<user>] => give item of rarity itemRarity from character characterId or all if itemRarity is 'all' to user or oneself if no user is defined
   * /give low [<user>] => give all items from low character to user or oneself if no user is defined
   * /give regular [<user>] => give all items from regular character to user or oneself if no user is defined
   * /give high [<user>] => give all items from high character to user or oneself if no user is defined
   * /give event [<user>] => give all event items to user or oneself if no user is defined
   * /give common [<user>] => give all common items except event to user or oneself if no user is defined
   * /give uncommon [<user>] => give all uncommon items except event to user or oneself if no user is defined
   * /give rare [<user>] => give all rare items except event to user or oneself if no user is defined
   * /give epic [<user>] => give all epic items except event to user or oneself if no user is defined
   */
  const settings = message.settings = client.getSettings(message.guild);
  var user = '' ;
  if (action != 'from') {
    var userJoin = args.join (' ') ;  
    user = (! userJoin) ? message.member : getUser (message, userJoin) ;  
  } else {
    characterId = args [0] ;
    itemRarity = args [1].toLowerCase() ;
    var userJoin = args.slice(2).join (' ') ;  
    user = (! userJoin) ? message.member : getUser (message, userJoin) ;  
  }
  const allCharacterRarity = ["low", "regular", "high", "event"] ;
  const allItemRarity = ["common", "uncommon", "rare", "epic"] ;

  if (action.toLowerCase() === "all") {
    try {
      const guild_id = message.guild.id, owner_id = user.id ;
      var [rows, fields] = await client.connection.promise().query ("select id as characterId from wanshitong.`character` where rarity<>4 ;") ;
      rows.forEach (async (row) => {
        let [rowsI, fieldsI] = await client.connection.promise().query ("select id as itemId from wanshitong.item where character_id=? ;", [row.characterId]) ;
        rowsI.forEach (rowI => {
          client.connection.execute ("insert into wanshitong.inventory (owner_id, item_id, guild_id) values (?, ?, ?) on duplicate key update item_id=item_id ;", [owner_id, rowI.itemId, guild_id], (err, res, fields) => {
            if (err) console.error (err) ;
            // console.log (res) ;
          })
        })
      }) ;
      message.reply (`all items given to ${user.displayName}.`) ;
    } catch (err) {
      console.log ("err give all:", err) ;
      message.reply ("an error occured !") ;
    }
  } else

  if (allCharacterRarity.includes (action.toLowerCase())) {
    var table = "inventory"+(action === "event" ? "_event" : "") ;
    try {
      const guild_id = message.guild.id, owner_id = user.id ;
      var [rows, fields] = await client.connection.promise().query ("select id as characterId from wanshitong.`character` where rarity=? ;", [client.getRarityFromName(action)]) ;
      rows.forEach (async (row) => {
        let [rowsI, fieldsI] = await client.connection.promise().query ("select id as itemId from wanshitong.item where character_id=? ;", [row.characterId]) ;
        rowsI.forEach (rowI => {
          client.connection.execute (`insert into wanshitong.${table} (owner_id, item_id, guild_id) values (?, ?, ?) on duplicate key update item_id=item_id ;`, [owner_id, rowI.itemId, guild_id], (err, res, fields) => {
            if (err) console.error (err) ;
            // console.log (res) ;
          })
        })
      }) ;
      message.reply (`all items from ${action} characters given to ${user.displayName}.`) ;
    } catch (err) {
      console.log ("err give allItems:", err) ;
      message.reply ("an error occured !") ;
    }
  } else

  if (allItemRarity.includes (action.toLowerCase())) {
    try {
      const guild_id = message.guild.id, owner_id = user.id ;
      var [rows, fields] = await client.connection.promise().query ("select id as characterId from wanshitong.`character` where rarity<>4 ;") ;
      rows.forEach (async (row) => {
        let [rowsI, fieldsI] = await client.connection.promise().query ("select id as itemId from wanshitong.item where character_id=? and rarity=?;", [row.characterId, client.getItemRarityFromName (action)]) ;
        rowsI.forEach (rowI => {
          client.connection.execute ("insert into wanshitong.inventory (owner_id, item_id, guild_id) values (?, ?, ?) on duplicate key update item_id=item_id ;", [owner_id, rowI.itemId, guild_id], (err, res, fields) => {
            if (err) console.error (err) ;
            // console.log (res) ;
          })
        })
      }) ;
      message.reply (`all items from rarity ${action} given to ${user.displayName}.`) ;
    } catch (err) {
      console.log ("err give allItems:", err) ;
      message.reply ("an error occured !") ;
    }
  } else

  if (action.toLowerCase() === "from") {
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
      rowsI.forEach (rowI => {
        client.connection.execute (`insert into wanshitong.${table} (owner_id, item_id, guild_id) values (?, ?, ?) on duplicate key update item_id=item_id ;`, [owner_id, rowI.itemId, guild_id], (err, res, fields) => {
          if (err) console.error (err) ;
          // console.log (res) ;
        }) ;
      }) ;
      message.reply (`give ${itemRarity === "all" ? "all items" : "item of rarity "+itemRarity} from ${characterName} to ${user.displayName}.`) ;
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
  aliases: ["gimme"],
  permLevel: "Moderator"
};

exports.help = {
  name: "give",
  category: "Game",
  description: `Give items directly to a user`,
  usage: 
  `give all [<user>]        => give all items to user or oneself if no user is defined
        give low [<user>]        => give all items from low character to user or oneself if no user is defined
        give regular [<user>]    => give all items from regular character to user or oneself if no user is defined
        give high [<user>]       => give all items from high character to user or oneself if no user is defined
        give event [<user>]      => give all items from event character to user or oneself if no user is defined
        give common [<user>]     => give all common items, except events one, to user or oneself if no user is defined
        give uncommon [<user>]   => give all uncommon items, except events one, to user or oneself if no user is defined
        give rare [<user>]       => give all rare items, except events one, to user or oneself if no user is defined
        give epic [<user>]       => give all epic items, except events one, to user or oneself if no user is defined
        give from <characterId> <itemRarity> [<user>] => give item of rarity itemRarity from character characterId or all if itemRarity is 'all' to user or oneself if no user is defined`
};

getUser = (message, userJoin) => {
  return message.guild.members.cache.find (u => u.id === userJoin || u.displayName === userJoin || (userJoin.match(/^<@!?(\d+)>$/) && u.id === userJoin.match(/^<@!?(\d+)>$/)[1]) || u.user.tag === userJoin || u.user.username === userJoin ) ;
}