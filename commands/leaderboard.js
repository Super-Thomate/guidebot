exports.run = async (client, message, args, level) => {
  const guild = message.guild ;
  const maxPerPage = 10 ;
  var [rows, fields] = await client.connection.promise().query ("select count(*) as total from `wanshitong`.`gamelb` where guild_id=? ;", [message.guild.id]) ;
  const numPage = Math.ceil (rows[0].total / maxPerPage) || 1 ;
  var currentPage = 1 ;
  // embed
  var characterEmbed = new client.Discord.MessageEmbed()
                             .setColor("#DDA624")
                             .setTitle(`Scoreboard ${message.guild.name}`)
                             .setFooter (`1/${numPage}`)
                             ;
  const descHeader = `  Rank.  | Items | User \n` ;
  var maxLength = descHeader.length ;
  var body = await getBody (client, guild, maxLength, message, currentPage, maxPerPage) ;
  var descSeparator = `${"=".repeat(Math.min (body [1], 61))}\n` ;
  // ============================================================= << 61 characters max
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
      body = await getBody (client, guild, maxLength, message, currentPage, maxPerPage) ;
      descSeparator = `${"=".repeat(Math.min (body [1], 61))}\n` ;
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
  characterEmbed.setDescription ("```"+`${descHeader}${descSeparator}`+"```") ;
  await message.channel.send(characterEmbed);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["lb", "dummy"],
  permLevel: "User"
};

exports.help = {
  name: "leaderboard",
  category: "Game",
  description: "Display the current leaderboard.",
  usage: "leaderboard [page]"
};


async function getBody (client, guild, maxLength, message, page, maxPerPage) {
  let description = "" ;
  const limit = (page-1)*maxPerPage ;
  let [rows, fields] = await client.connection.promise().query ("select user_id, items, complete from `wanshitong`.`gamelb` where guild_id=? order by items desc, date_completed asc limit "+limit+", "+maxPerPage+" ;", [guild.id]) ;
  var ranking = (page-1)*maxPerPage ;
  rows.forEach ( (row) => {
    ranking++ ;
    let guildMember = guild.members.cache.find(user => user.id == row.user_id) ;
    if (! guildMember) {
      console.log (`GuildMember not found in cache with user_id = ${row.user_id}`) ;
      guildMember = {"displayName": "NONAME", "user":{"tag": "NOTAG"}} ;
    }
    let items = `${row.items}` ;
    let complete = row.items>=client.maxItem [guild.id] || row.complete;
    let rankStr = `${complete?"🦊️":""}${ranking}.` ;
    let newLine = ` ${" ".repeat (7-rankStr.length)}${rankStr} | ${" ".repeat (5-items.length)}${items} | ${row.user_id === message.author.id ? "Vous => ":""}${guildMember.displayName} (${guildMember.user.tag})\n` ;
    maxLength = Math.max(maxLength, newLine.length) ;
    description += newLine ;
  }) ;
  /*
  for (let row of rows) {
    console.log (row) ;
  }
  */
  return [description, maxLength] ;
}