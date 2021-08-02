exports.run = async (client, message, [action, ...args], level) => { // eslint-disable-line no-unused-vars
    /*
     * Spawn command
     * /spawn => get a random character with random item
     * /spawn id characterId => get character with id characterId with random item
     * /spawn rarity characterRarity => get a random character from rarity characterRarity with random item
     * /spawn item characterId itemRarity => get character with id characterId with item itemRarity
     */
    const settings = message.settings = client.getSettings(message.guild);
    
    if (action === "rarity") {
      const allRarity = ["high", "regular", "low", "event"] ;
      const rarity = args [0].toLowerCase() ;
      if (! rarity) return message.reply('specify a rarity.') ;
      if (! allRarity.includes (rarity)) return message.reply(`${rarity} is not valid: use ${allRarity}.`) ;
      try {
        client.dropCharacter (message.channel, message.settings, client.getRarityFromName (rarity)) ;
      } catch (err) {
        console.log ("err spawn rarity:", err) ;
        message.reply ("an error occured !") ;
      }
    } else 
    
    if (action === "item") {
      const id = args [0] ;
      const allRarity = ["common", "uncommon", "rare", "epic"] ;
      const itemRarity = args [1].toLowerCase() ;
      if (!id) return message.reply ('specify an id.') ;
      if (! itemRarity) return message.reply('specify a rarity.') ;
      if (! allRarity.includes (itemRarity)) return message.reply(`${itemRarity} is not valid: use ${allRarity}.`) ;
      try {
        client.dropCharacter (message.channel, message.settings, null, id, client.getItemRarityFromName (itemRarity)) ;
      } catch (err) {
        console.log ("err spawn item:", err) ;
        message.reply ("an error occured !") ;
      }
    } else 
    
    if (action === "id") {
      const id = args.join (' ').toLowerCase() ;
      if (!id) return message.reply ('specify an id.') ;
      try {
        client.dropCharacter (message.channel, message.settings, null, id) ;
      } catch (err) {
        console.log ("err spawn id:", err) ;
        message.reply ("an error occured !") ;
      }
    } else 
    
    {
      try {
        const guildConf = client.settings.get (message.guild.id) ;
        await client.dropCharacter (message.channel, settings) ;
      } catch (err) {
        console.log ("err spawn:", err) ;
        message.reply ("an error occured !") ;
      }
    }

    message.delete () ;
  };
  
  exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Moderator"
  };
  
  exports.help = {
    name: "spawn",
    category: "Game",
    description: `Spawn a random or selected character in random or selected rarity.`,
    usage: 
       `spawn                                   => get a random character with random item
        spawn id <characterId>                  => get character with id characterId with random item
        spawn item <characterId> <itemRarity>   => get character with id characterId with item itemRarity
        spawn rarity <characterRarity>          => get a random character from rarity characterRarity with random item`
  };