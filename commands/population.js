const { Formatters } = require("discord.js");

exports.run = async (client, message, [action, value], level) => { // eslint-disable-line no-unused-vars
  if (action === "character" || action === "c") {
    // LIST ALL CHARACTER
    const maxPerPage = 20 ;
    const page = (typeof value != 'undefined' && value != null) ? Number.parseInt (value) : 1;
    if (Number.isNaN (page)) return message.channel.send ({content: `Value ${value} for page is not a number.`}) ;
    var [rows, fields] = await client.connection.promise().query ("select count (*) as total from `wanshitong`.`character` ;") ;
    const numPage = Math.ceil (rows[0].total / maxPerPage) || 1 ;
    if (page > numPage) return message.channel.send ({content: `${page} is greater than the maximum number of page ${numPage}`}) ;
    const limit = (page-1)*maxPerPage ;
    [rows, fields] = await client.connection.promise().query ("select `id`, `name`, `rarity`, `is_available` from `wanshitong`.`character` limit "+limit+","+maxPerPage) ;
    //[rows, fields] = await client.connection.promise().query ("select `id`, `name`, `rarity` from `wanshitong`.`character` limit 0,20") ;
    let textFinal = "" ;
    rows.forEach ((row) => {
      let textCurrent = `#${row.id} ${row.name} [${client.getRarityCharacter (row.rarity)}] ${row.is_available?"":"IN"}disponible\n` ;
      textFinal += textCurrent ;
    }) ;
    await message.channel.send({content: Formatters.codeBlock("asciidoc", `= Population =\n${textFinal}\n= ${page}/${numPage} =`)});
  } else
  
  if (action === "item" || action === "i") {
    // LIST ALL ITEMS
    const maxPerPage = 20 ;
    const page = (typeof value != 'undefined' && value != null) ? Number.parseInt (value) : 1;
    if (Number.isNaN (page)) return message.channel.send ({content: `Value ${value} for page is not a number.`}) ;
    var [rows, fields] = await client.connection.promise().query ("select count (*) as total from `wanshitong`.`item` ;") ;
    const numPage = Math.ceil (rows[0].total / maxPerPage) || 1 ;
    if (page > numPage) return message.channel.send ({content: `${page} is greater than the maximum number of page ${numPage}`}) ;
    const limit = (page-1)*maxPerPage ;
    [rows, fields] = await client.connection.promise().query ("select A.`id` as itemId, A.`name` as itemName, A.`rarity` as itemRarity, B.`name` as characterName from `wanshitong`.`item` as A inner join `wanshitong`.`character` as B where B.id = A.character_id limit "+limit+","+maxPerPage) ;
    let textFinal = "" ;
    rows.forEach ((row) => {
      let textCurrent = `[${client.getRarityItem (row.itemRarity)}] ${row.itemName} (${row.characterName}) \n` ;
      textFinal += textCurrent ;
    }) ;
    await message.channel.send({content: Formatters.codeBlock("asciidoc", `= Population =\n${textFinal}\n= ${page}/${numPage} =`)}, {code: "asciidoc"});
  } else
  /*
  if (action === "message" || action === "m") {
    try {
      const [rows, fields] = await client.connection.promise().query ("select message, `drop` from wanshitong.`occurance` where guild_id=? ;", [message.guild.id]) ;
      if (rows.length) {
        const row = rows [0] ;
        message.channel.send (`= Percentage =\n${row.message} message with ${row.drop} character => ${row.drop/row.message * 100}%.`, {code: "asciidoc"}) ;
      } else {
        message.channel.send (`= Percentage =\nEmpty.`, {code: "asciidoc"}) ;
      }
    } catch (err) {
      console.error ("", err) ;
      message.reply ({content: "error on pop message."}) ;
    }
  } else 
  */
  {
    message.channel.send ({content: `Action ${action} unknown.`}) ;
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

