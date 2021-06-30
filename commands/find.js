exports.run = async (client, message, [action, ...args], level) => { // eslint-disable-line no-unused-vars
    /*
     * Find command
     * /find character <name>
     */
    const settings = message.settings = client.getSettings(message.guild);
    
    if (! action) return message.reply (`action required !`) ;
    action = action.toLowerCase() ;
    
    const allCharacterRarity = ["low", "regular", "high", "event"] ;
    const allItemRarity = ["common", "uncommon", "rare", "epic"] ;
    
    if (action === "character") {
      try {
        var whereClause = "" ;
        var whereArgs = [] ;
        var result = "" ;
        args.forEach (arg => {
          whereClause += (whereClause.length ? " or " : "" )+"name like ?" ;
          whereArgs.push (`%${arg}%`)
        }) ;
        var [rows, fields] = await client.connection.promise().query ("select id, name, rarity from wanshitong.`character` where "+whereClause+" ;", whereArgs) ;
        rows.forEach (row => {
          result += `* [${client.getRarityCharacter (row.rarity)}] ${row.name}#${row.id}\n` ;
        }) ;
        var searchResult = `= Search Character Result =\n${result.length ? result : "No result found !"}` ;
        message.channel.send (searchResult, {code: "asciidoc", split: { char: "\u200b" }})
      } catch (err) {
        console.log ("err find character:", err) ;
        message.reply ("an error occured !") ;
      }
    } else

    if (action === "item") {
      try {
        const guild_id = message.guild.id ;
        var whereClause = "" ;
        var whereArgs = [] ;
        var result = "" ;
        args.forEach (arg => {
          whereClause += (whereClause.length ? " or " : "" )+"A.name like ?" ;
          whereArgs.push (`%${arg}%`)
        }) ;
        var [rows, fields] = await client.connection.promise().query ("select A.name as itemName, A.id as itemId, A.rarity as itemRarity, B.id as characterId, B.name as characterName from wanshitong.`item` as A, wanshitong.`character` as B  where B.id=A.character_id and ("+whereClause+") ;", whereArgs) ;
        rows.forEach (async (row) => {
          result += `* [${client.getRarityItem(row.itemRarity)}] ${row.itemName}#${row.itemId} from ${row.characterName}#${row.characterId}\n` ;       
        }) ;
        var searchResult = `= Search Item Result =\n${result.length ? result : "No result found !"}` ;
        message.channel.send (searchResult, {code: "asciidoc", split: { char: "\u200b" }})
      } catch (err) {
        console.log ("err find item:", err) ;
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
    aliases: ["who", "search"],
    permLevel: "Moderator"
  };
  
  exports.help = {
    name: "find",
    category: "Game",
    description: `Find a character or an item`,
    usage: 
    `find character <keywords>   => find all character containing the keywords
          find item <keywords>        => find all items containing the keywords`
  };