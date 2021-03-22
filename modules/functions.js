module.exports = (client) => {

  /*
  PERMISSION LEVEL FUNCTION

  This is a very basic permission system for commands which uses "levels"
  "spaces" are intentionally left black so you can add them if you want.
  NEVER GIVE ANYONE BUT OWNER THE LEVEL 10! By default this can run any
  command including the VERY DANGEROUS `eval` and `exec` commands!

  */
  client.permlevel = message => {
    let permlvl = 0;

    const permOrder = client.config.permLevels.slice(0).sort((p, c) => p.level < c.level ? 1 : -1);

    while (permOrder.length) {
      const currentLevel = permOrder.shift();
      if (message.guild && currentLevel.guildOnly) continue;
      if (currentLevel.check(message)) {
        permlvl = currentLevel.level;
        break;
      }
    }
    return permlvl;
  };

  /*
  GUILD SETTINGS FUNCTION

  This function merges the default settings (from config.defaultSettings) with any
  guild override you might have for particular guild. If no overrides are present,
  the default settings are used.

  */
  
  // THIS IS HERE BECAUSE SOME PEOPLE DELETE ALL THE GUILD SETTINGS
  // And then they're stuck because the default settings are also gone.
  // So if you do that, you're resetting your defaults. Congrats.
  const defaultSettings = {
    "prefix": "/",
    "modLogChannel": "mod-log",
    "modRole": "Moderator",
    "adminRole": "Administrator",
    "systemNotice": "true",
    "welcomeChannel": "welcome",
    "welcomeMessage": "Say hello to {{user}}, everyone! We all need a warm welcome sometimes :D",
    "welcomeEnabled": "false",
    // Everything for Minigame
    "occuranceDrop": 10.0, // Drop rate of a character after a message
    "toggleCommandTrigger": "false", // Toggle for whether or not a bot command will trigger the drop
    "dropChannel": "library", // The channel where the bot will drop a character
    "claimTime": 10000, // Time in ms to claim an item after character drop
    "characterRate": {"high":25.0, "regular":25.0, "low":25.0, "event":25.0}, // Character drop rate depending on rarity
    "itemRate": {"common":25.0, "uncommon":25.0, "rare":25.0, "epic":25.0}, // Item drop rate depending on rarity
    "commandClaim": ["foo", "bar"] // Command word to claim
  };

  // getSettings merges the client defaults with the guild settings. guild settings in
  // enmap should only have *unique* overrides that are different from defaults.
  client.getSettings = (guild) => {
    client.settings.ensure("default", defaultSettings);
    if(!guild) return client.settings.get("default");
    const guildConf = client.settings.get(guild.id) || {};
    // This "..." thing is the "Spread Operator". It's awesome!
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    return ({...client.settings.get("default"), ...guildConf});
  };

  /*
  SINGLE-LINE AWAITMESSAGE

  A simple way to grab a single reply, from the user that initiated
  the command. Useful to get "precisions" on certain things...

  USAGE

  const response = await client.awaitReply(msg, "Favourite Color?");
  msg.reply(`Oh, I really love ${response} too!`);

  */
  client.awaitReply = async (msg, question, limit = 60000) => {
    const filter = m => m.author.id === msg.author.id;
    await msg.channel.send(question);
    try {
      const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
      return collected.first().content;
    } catch (e) {
      return false;
    }
  };


  /*
  MESSAGE CLEAN FUNCTION

  "Clean" removes @everyone pings, as well as tokens, and makes code blocks
  escaped so they're shown more easily. As a bonus it resolves promises
  and stringifies objects!
  This is mostly only used by the Eval and Exec commands.
  */
  client.clean = async (client, text) => {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof text !== "string")
      text = require("util").inspect(text, {depth: 1});

    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replace(client.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");

    return text;
  };

  client.loadCommand = (commandName) => {
    try {
      client.logger.log(`Loading Command: ${commandName}`);
      const props = require(`../commands/${commandName}`);
      if (props.init) {
        props.init(client);
      }
      client.commands.set(props.help.name, props);
      props.conf.aliases.forEach(alias => {
        client.aliases.set(alias, props.help.name);
      });
      return false;
    } catch (e) {
      return `Unable to load command ${commandName}: ${e}`;
    }
  };

  client.unloadCommand = async (commandName) => {
    let command;
    if (client.commands.has(commandName)) {
      command = client.commands.get(commandName);
    } else if (client.aliases.has(commandName)) {
      command = client.commands.get(client.aliases.get(commandName));
    }
    if (!command) return `The command \`${commandName}\` doesn"t seem to exist, nor is it an alias. Try again!`;
    
    if (command.shutdown) {
      await command.shutdown(client);
    }
    const mod = require.cache[require.resolve(`../commands/${command.help.name}`)];
    delete require.cache[require.resolve(`../commands/${command.help.name}.js`)];
    for (let i = 0; i < mod.parent.children.length; i++) {
      if (mod.parent.children[i] === mod) {
        mod.parent.children.splice(i, 1);
        break;
      }
    }
    return false;
  };

  /* MISCELANEOUS NON-CRITICAL FUNCTIONS */
  
  // EXTENDING NATIVE TYPES IS BAD PRACTICE. Why? Because if JavaScript adds this
  // later, this conflicts with native code. Also, if some other lib you use does
  // this, a conflict also occurs. KNOWING THIS however, the following 2 methods
  // are, we feel, very useful in code. 
  
  // <String>.toPropercase() returns a proper-cased string such as: 
  // "Mary had a little lamb".toProperCase() returns "Mary Had A Little Lamb"
  Object.defineProperty(String.prototype, "toProperCase", {
    value: function() {
      return this.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
  });
  
  Object.defineProperty(String.prototype, "upperCaseFirstLetter", {
    value: function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }
  });
  
  Object.defineProperty(String.prototype, "lowerCaseFirstLetter", {
    value: function() {
      return this.charAt(0).toLowerCase() + this.slice(1);
    }
  });

  // <Array>.random() returns a single random element from an array
  // [1, 2, 3, 4, 5].random() can return 1, 2, 3, 4 or 5.
  Object.defineProperty(Array.prototype, "random", {
    value: function() {
      return this[Math.floor(Math.random() * this.length)];
    }
  });
  
  Array.prototype.removeItem = function (item) {
    var indexOf = this.indexOf(item) ;
    if (indexOf === -1) return this ;
    var rest = this.slice((indexOf || indexOf) + 1 || this.length);
    this.length = indexOf < 0 ? this.length + indexOf : indexOf;
    return this.push.apply(this, rest) ;
  };
  
  Array.prototype.removeAllItem = function (item) {
    var indexOf = this.indexOf(item) ;
    if (indexOf === -1) return this ;
    while (indexOf != -1) {
      var rest = this.slice((indexOf || indexOf) + 1 || this.length);
      this.length = indexOf < 0 ? this.length + indexOf : indexOf;
      this.push.apply(this, rest)
      indexOf = this.indexOf(item) ;
      console.log (indexOf) ;
    }
    return this.length ;
  };

  // `await client.wait(1000);` to "pause" for 1 second.
  client.wait = require("util").promisify(setTimeout);

  // These 2 process methods will catch exceptions and give *more details* about the error and stack trace.
  process.on("uncaughtException", (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    client.logger.error(`Uncaught Exception: ${errorMsg}`);
    console.error(err);
    // Always best practice to let the code crash on uncaught exceptions. 
    // Because you should be catching them anyway.
    process.exit(1);
  });

  process.on("unhandledRejection", err => {
    client.logger.error(`Unhandled rejection: ${err}`);
    console.error(err);
  });
  
  // GAME
  client.getRandomRarity = (rarityRate) => {
    let currentScore = 0 ;
    let number = Math.floor(Math.random() * 100) + 1;
    for (let key in rarityRate) {
      currentScore+=rarityRate [key];
      if (number <= currentScore)
       return key ;
    }
    return -1 ;
  } ;
  
  client.getRandomRarityInt = (rarityRate) => {
    let currentScore = 0 ;
    let number = Math.floor(Math.random() * 100) + 1;
    let i = 0 ;
    for (let key in rarityRate) {
      currentScore+=rarityRate [key];
      i++ ;
      if (number <= currentScore) return i ;
    }
    return -1 ;
  } ;
  
  client.getRarityCharacter = (rarity) => {
    return ["Haut","Régulier","Bas","Événementiel"] [rarity-1] ;
  } ;
  client.getRarityItem = (rarity) => {
    return ["Commun","Non commun","Rare","Épique"] [rarity-1] ;
  } ;
  
  client.getRarityEmoji = (rarity) => {
    return ["<:common:578905506022948874>", "<:uncommon:578905506165293076>", "<:rare:578905506706358282>", "<:epic:578905506693775360>"] [rarity-1] ;
  }
  
  const colors = {
   "base": "#DDA624",
   1: "#CFCFCD", // common
   2: "#9AEE3F", // uncommon
   3:  "#2794CD", // rare
   4: "#9F59DD", // epic
   "left": "#B20C20"
  } ;
  
  client.dropCharacter = async (channel, setting) => {
    const commandClaim = setting.commandClaim.random() ;
    const character = client.getRandomRarityInt (setting.characterRate) ;
    const item = client.getRandomRarityInt (setting.itemRate) ;
    const guild_id = channel.guild.id ;
    const prefix = setting.prefix || defaultSettings.prefix ;
    const filter = async (m) => {
      return (    m.content.startsWith (`${prefix}`)
               && isCommandClaim (m.content.toLowerCase(), setting.commandClaim)
               && ! await isBlackList (m.member, client)
             ) ;
      
    } ;
    
    if (character === -1 || item === -1) return channel.send ("An error occured ! Check your rate.") ;
    var [rows,fields] =
      await client
              .connection
              .promise ()
              .execute (   "select    A.`id` as characterId \n"+
                           "        , A.`name` as characterName \n"+
                           "        , A.`image`as characterImage \n"+
                           "        , B.`id` as itemId \n"+
                           "        , B.`name` as itemName \n"+
                           "        , B.`rarity` as itemRarity \n"+
                           " from `wanshitong`.`character` as A, `wanshitong`.`item` as B \n"+
                           "where A.`rarity` = ? and B.`character_id` = A.`id` and B.`rarity` = ? AND A.guild_id=? AND A.`is_available`=1 ;"
                         , [character, item, guild_id]
                       ) ;
    const row = rows.random() ; //get one among all the possibilities
    var characterEmbed = new client.Discord.MessageEmbed()
                             .setColor(colors.base)
                             .setTitle(`${row.characterName} s'approche.`)
                             .setDescription(`${row.characterName} souhaite vous offrir quelque chose.\nTapez \`${prefix}${commandClaim}\` pour le récupérer.`)
                             .setImage(row.characterImage)
                             ;
    const msgEmbed = await channel.send (characterEmbed) ;
    let already = false ;
    const collector = channel.createMessageCollector(filter,  {max:1, time: setting.claimTime, errors: ["time"]});
    const handleDelete = (msg) => {
      if (msg.id === msgEmbed.id) {
        console.log ("Something deleted the character") ;
        collector.stop ("erased") ;
      }
      client.off ("messageDelete", handleDelete) ;
    } ;
    client.on ("messageDelete", handleDelete) ;
    collector.on('collect', async (collected) => {
      if (collected.content.toLowerCase() !== `${prefix}${commandClaim.toLowerCase()}`) {
        return collector.stop ("wrong answer") ;
      }
      // Add to inventory
      const author = collected.author ;
      [rows,fields] = await client.connection.promise().query ("select count (*) as already from wanshitong.inventory where owner_id=? and item_id=? and guild_id=?;", [author.id, row.itemId, guild_id]) ;
      already = rows[0].already ;
      if (! already) {
        await client.connection.promise().execute ("insert into wanshitong.inventory (owner_id, item_id, guild_id) values (?, ?, ?) ;", [author.id, row.itemId, guild_id]) ;
      }
      characterEmbed
        .setTitle (`${row.characterName} repart.`)
        .setDescription (`<@${author.id}> ${row.characterName} t'a offert ${row.itemName}.\n${client.getRarityEmoji(item)} C'est un objet **${client.getRarityItem(item).lowerCaseFirstLetter()}** ${client.getRarityEmoji(item)}. ${already?"\n*Vous lui rendez parce que vous l'avez déjà.*":""}`)
        .setColor (colors[item]) ;
      msgEmbed.edit (characterEmbed) ;
      collector.stop ("claimed") ;
    });
    
    collector.on('end', (collected, reason) => {
      if (reason == "erased") {
        client.off ("messageDelete", handleDelete) ;
        if (typeof client.alreadyDropped [channel.guild.id] !== "undefined" && client.alreadyDropped [channel.guild.id] !== null) {
          client.alreadyDropped [channel.guild.id] = null ;
        }
        return ;
      }
      let msgCollected = collected.first() ;
      if ((reason === "time") || (reason === "wrong answer")) {
        characterEmbed
          .setTitle (`${row.characterName} disparaît.`) // est parti·e
          .setDescription (`${(reason === "time")?"Oh non, vous n'avez pas été assez rapide !":"Ce n'était pas la réponse attendue !"}`)
          .setColor (colors.left) ;
        msgEmbed.edit (characterEmbed) ;
      }
      if ((reason !== "time"))
        msgCollected.delete({timeout:500})
          .then(msg => console.log(`Deleted message ${msg.content}`))
          .catch(console.error);
      if (typeof client.alreadyDropped [channel.guild.id] !== "undefined" && client.alreadyDropped [channel.guild.id] !== null) {
        client.alreadyDropped [channel.guild.id] = null ;
      }
      client.off ("messageDelete", handleDelete) ;
    });
  } ;
  
  
  function isCommandClaim (content, commandClaim) {
    let isIt = false ;
    commandClaim.forEach (c => {
      if (content.slice(1) === c.toLowerCase())
        isIt = true ;
    }) ;
    return isIt ;
  }
  async function isBlackList (member, client) {
    const [rows, fields] = await client.connection.promise().query ("select count(*) as ban from wanshitong.blacklist where user_id=? and guild_id=?", [member.id, member.guild.id]) ;
    return (rows[0].ban != 0) ;
  }
  
};
