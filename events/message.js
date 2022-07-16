// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.

module.exports = async (client, message) => {
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if (message.author.bot) return;

  // Grab the settings for this server from Enmap.
  // If there is no guild, get default conf (DMs)
  const settings = message.settings = client.getSettings(message.guild);

  // Checks if the bot was mentioned, with no message after it, returns the prefix.
  const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
  if (message.content.match(prefixMention)) {
    return message.reply(`My prefix on this guild is \`${settings.prefix}\``);
  }

  // console.log ("message.content: ", message.content) ;
  if ((! await client.isBlackList (message.member, "magic")) && (settings.questionEnabled == "true") && (message.content.startsWith (`<@${client.user.id}>`) || message.content.startsWith (`<@!${client.user.id}>`) || message.content.startsWith (`<@?${client.user.id}>`)) && message.content.endsWith("?")) {
    const answer = [ "Essaye plus tard",
                     "Essaye encore",
                     "Pas d'avis",
                     "C'est ton destin",
                     "Le sort en est jeté",
                     "Une chance sur deux",
                     "Repose ta question",
                     "D'après moi oui",
                     "C'est certain",
                     "Oui absolument",
                     "Tu peux compter dessus",
                     "Sans aucun doute",
                     "Très probable",
                     "Oui",
                     "C'est bien parti",
                     "C'est non",
                     "Peu probable",
                     "Faut pas rêver",
                     "N'y compte pas",
                     "Impossible"
                   ] ;
   message.reply (answer.random()+".") ;
  }
  
  // Here we will handle the trigger for character spawn
  // Toggle config => a command trigger or not the character spawn
  if ((settings.toggleCommandTrigger == "true") || (message.content.indexOf(settings.prefix) !== 0)) {
   const drop = Math.floor(Math.random() * 100) + 1;
   // client.connection.execute ("insert into wanshitong.`occurance` (message, guild_id) values (1, ?) on duplicate key update message=message+1 ;", [message.guild.id], (err, res) => {if (err) console.error ("occurrance message:", err)}) ;
   if ((drop <= settings.occuranceDrop) && (typeof client.alreadyDropped [message.guild.id] === "undefined" || client.alreadyDropped [message.guild.id] === null)) {
     client.alreadyDropped [message.guild.id] = Date.now() ;
     console.log ("["+Date.toString()+"] Drop the charater") ;
     // client.connection.execute ("update wanshitong.`occurance` set `drop`=`drop`+1 where guild_id=? ;", [message.guild.id], (err, res) => {if (err) console.error ("occurrance drop:", err)}) ;
     try {
       const dropChannel = await message.guild.channels.cache.find(c => c.name === settings.dropChannel) ;
       if (typeof(dropChannel) === 'undefined' || dropChannel === null) {
         console.error ("dropChannel is not defined") ;
         client.alreadyDropped [message.guild.id] = null ;
         return ;
       }
       // await dropChannel.send ("Drop ici") ;
       await client.dropCharacter (dropChannel, settings) ;
     } catch (err) {
       console.error (err) ;
       client.alreadyDropped [message.guild.id] = null ;
     }
   }
  };
  
  // Also good practice to ignore any message that does not start with our prefix,
  // which is set in the configuration file.
  if (message.content.indexOf(settings.prefix) !== 0) return;

  // Here we separate our "command" name, and our "arguments" for the command.
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // If the member on a guild is invisible or not cached, fetch them.
  if (message.guild && !message.member) await message.guild.members.fetch(message.author);

  // Get the user or member's permission level from the elevation
  const level = client.permlevel(message);

  // Check whether the command, or alias, exist in the collections defined
  // in app.js.
  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
  // using this const varName = thing OR  otherThing; is a pretty efficient
  // and clean way to grab one of 2 values!
  if (!cmd) return;

  // Some commands may not be useable in DMs. This check prevents those commands from running
  // and return a friendly error message.
  if (cmd && !message.guild && cmd.conf.guildOnly)
    return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");

  if (level < client.levelCache[cmd.conf.permLevel]) {
    if (settings.systemNotice === "true") {
      return message.channel.send(`You do not have permission to use this command.
  Your permission level is ${level} (${client.config.permLevels.find(l => l.level === level).name})
  This command requires level ${client.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
    } else {
      return;
    }
  }

  // To simplify message arguments, the author's level is now put on level (not member so it is supported in DMs)
  // The "level" command module argument will be deprecated in the future.
  message.author.permLevel = level;
  
  message.flags = [];
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1));
  }
  // If the command exists, **AND** the user has permission, run it.
  client.logger.cmd(`[CMD] ${client.config.permLevels.find(l => l.level === level).name} ${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`);
  cmd.run(client, message, args, level);
};
