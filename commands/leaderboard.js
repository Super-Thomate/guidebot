exports.run = async (client, message, args, level) => {
  const guild = message.guild ;
  const maxPerPage = 10 ;
  var [rows, fields] = await client.connection.promise().query ("select owner_id, count (*) as total from `wanshitong`.`inventory` where guild_id=? group by owner_id ;", [message.guild.id]) ;
  const numPage = Math.ceil (rows.length / maxPerPage) || 1 ;
  var currentPage = 1 ;
  // embed
  var characterEmbed = new client.Discord.MessageEmbed()
                             .setColor("#DDA624")
                             .setTitle(`Scoreboard ${message.guild.name}`)
                             .setFooter (`1/${numPage}`)
                             ;
  const descHeader = `  Rank.  | Items | User \n` ;
  var maxLength = descHeader.length ;
  var [rows, fields] = await client.connection.promise().query ("select count(*) as total from wanshitong.`character` where guild_id=? and is_available=1;", [guild.id]) ;
  const totItem = rows [0].total * 4 ;
  var body = await getBody (client, guild, totItem, maxLength, message, currentPage, maxPerPage) ;
  const descSeparator = `${"=".repeat(body [1])}\n` ;
  if (body[0].length) {
    characterEmbed.setDescription ("```"+`${descHeader}${descSeparator}${body[0]}`+"```") ;
    let leaderboard = await message.channel.send(characterEmbed);
    leaderboard.react('◀')
       .then()
       .catch(console.error);
    leaderboard.react('▶')
       .then()
       .catch(console.error);
    // Create a reaction collector
    const filter = (reaction, user) => (reaction.emoji.name === '◀' || reaction.emoji.name === '▶') && !user.bot;
    const collector = leaderboard.createReactionCollector(filter, { time: 60000 });
    collector.on('collect', async (r) => {
      //console.log(`Collected ${r.emoji.name}`) ; 
      if (r.emoji.name === '◀') {
        currentPage-- ;
      } else {
       currentPage++ ;
      }
      if (currentPage <=0) currentPage = numPage ;
      if (currentPage > numPage) currentPage = 1 ;
      body = await getBody (client, guild, totItem, maxLength, message, currentPage, maxPerPage) ;
      characterEmbed.setDescription ("```"+`${descHeader}${descSeparator}${body[0]}`+"```") ;
      characterEmbed.setFooter (`${currentPage}/${numPage}`) ;
      leaderboard.edit (characterEmbed) ;
    });
    collector.on('end', collected => {
      //console.log(`Collected ${collected.size} items`) ;
      leaderboard.reactions.removeAll().catch(error => console.error('Failed to clear reactions: ', error));
    });
    return ;
  }
  
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["lb"],
  permLevel: "User"
};

exports.help = {
  name: "leaderboard",
  category: "Game",
  description: "Display the current leaderboard.",
  usage: "leaderboard [page]"
};


async function getBody (client, guild, totItem, maxLength, message, page, maxPerPage) {
  let description = "" ;
  const limit = (page-1)*maxPerPage ;
  let [rows, fields] = await client.connection.promise().query ("select owner_id, count(*) as items from wanshitong.inventory where guild_id=? group by owner_id order by items DESC limit "+limit+", "+maxPerPage+" ;", [guild.id]) ;
  var ranking = 0 ;
  rows.forEach ( (row) => {
    let guildMember = guild.members.cache.find(user => user.id === row.owner_id) ;
    ranking++ ;
    let items = `${row.items}` ;
    let complete = row.items>=totItem ;
    let rankStr = `${complete?"🏵️":""}${ranking}.` ;
    let newLine = ` ${" ".repeat (7-rankStr.length)}${rankStr} | ${" ".repeat (5-items.length)}${items} | ${row.owner_id === message.author.id ? "Vous => ":""}${guildMember.displayName} (${guildMember.user.tag})\n` ;
    maxLength = Math.max(maxLength, newLine.length) ;
    description += newLine ;
  }) ;
  
  return [description, maxLength] ;
}