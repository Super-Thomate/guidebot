exports.run = async (client, message, [action, value], level) => { // eslint-disable-line no-unused-vars
  if (action === "character" || action === "c") {
    // LIST ALL CHARACTER
    const maxPerPage = 20 ;
    const page = (typeof value != 'undefined' && value != null) ? Number.parseInt (value) : 1;
    if (Number.isNaN (page)) return message.channel.send (`Value ${value} for page is not a number.`) ;
    var [rows, fields] = await client.connection.promise().query ("select count (*) as total from `wanshitong`.`character` where guild_id=? ;", [message.guild.id]) ;
    const numPage = Math.ceil (rows[0].total / maxPerPage) || 1 ;
    if (page > numPage) return message.channel.send (`${page} is greater than the maximum number of page ${numPage}`) ;
    const limit = (page-1)*maxPerPage ;
    [rows, fields] = await client.connection.promise().query ("select `id`, `name`, `rarity`, `is_available` from `wanshitong`.`character` where guild_id=? limit "+limit+","+maxPerPage, [message.guild.id]) ;
    //[rows, fields] = await client.connection.promise().query ("select `id`, `name`, `rarity` from `wanshitong`.`character` limit 0,20") ;
    let textFinal = "" ;
    rows.forEach ((row) => {
      let textCurrent = `#${row.id} ${row.name} [${client.getRarityCharacter (row.rarity)}] ${row.is_available?"":"IN"}disponible\n` ;
      textFinal += textCurrent ;
    }) ;
    await message.channel.send(`= Population =\n${textFinal}\n= ${page}/${numPage} =`, {code: "asciidoc"});
  } else
  
  if (action === "item" || action === "i") {
    // LIST ALL ITEMS
    const maxPerPage = 20 ;
    const page = (typeof value != 'undefined' && value != null) ? Number.parseInt (value) : 1;
    if (Number.isNaN (page)) return message.channel.send (`Value ${value} for page is not a number.`) ;
    var [rows, fields] = await client.connection.promise().query ("select count (*) as total from `wanshitong`.`item` where guild_id=? ;", [message.guild.id]) ;
    const numPage = Math.ceil (rows[0].total / maxPerPage) || 1 ;
    if (page > numPage) return message.channel.send (`${page} is greater than the maximum number of page ${numPage}`) ;
    const limit = (page-1)*maxPerPage ;
    [rows, fields] = await client.connection.promise().query ("select A.`id` as itemId, A.`name` as itemName, A.`rarity` as itemRarity, B.`name` as characterName from `wanshitong`.`item` as A inner join `wanshitong`.`character` as B where B.id = A.character_id and A.guild_id=? limit "+limit+","+maxPerPage, [message.guild.id]) ;
    let textFinal = "" ;
    rows.forEach ((row) => {
      let textCurrent = `[${client.getRarityItem (row.itemRarity)}] ${row.itemName} (${row.characterName}) \n` ;
      textFinal += textCurrent ;
    }) ;
    await message.channel.send(`= Population =\n${textFinal}\n= ${page}/${numPage} =`, {code: "asciidoc"});
  } else {
    message.channel.send (`Action ${action} unknown.`) ;
  }
  
  
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["pop"],
  permLevel: "Moderator"
};

exports.help = {
  name: "population",
  category: "Game Settings",
  description: "Show the current database population.",
  usage: "population <character|item> [<page>]"
};

