// This command is to modify/edit guild configuration. Perm Level 3 for admins
// and owners only. Used for changing prefixes and role names and such.

const { Formatters } = require("discord.js");

// Note that there's no "checks" in this basic version - no config "types" like
// Role, String, Int, etc... It's basic, to be extended with your deft hands!

// Note the **destructuring** here. instead of `args` we have :
// [action, key, ...value]
// This gives us the equivalent of either:
// const action = args[0]; const key = args[1]; const value = args.slice(2);
// OR the same as:
// const [action, key, ...value] = args;
exports.run = async (client, message, [action, key, ...value], level) => { // eslint-disable-line no-unused-vars

  // Retrieve current guild settings (merged) and overrides only.
  const settings = message.settings;
  const defaults = client.settings.get("default");
  const overrides = client.settings.get(message.guild.id);
  if (!client.settings.has(message.guild.id)) client.settings.set(message.guild.id, {});
  
  // Edit an existing key value
  if (action === "edit") {
    // User must specify a key.
    if (!key) return message.reply({content: "Please specify a key to edit"});
    // User must specify a key that actually exists!
    if (!defaults[key]) return message.reply({content: "This key does not exist in the settings"});
    const joinedValue = value.join(" ");
    // User must specify a value to change.
    if (joinedValue.length < 1) return message.reply({content: "Please specify a new value"});
    // User must specify a different value than the current one.
    if (joinedValue === settings[key]) return message.reply({content: "This setting already has that value!"});
    
    // If the guild does not have any overrides, initialize it.
    if (!client.settings.has(message.guild.id)) client.settings.set(message.guild.id, {});

    // Modify the guild overrides directly.
    client.settings.set(message.guild.id, joinedValue, key);

    // Confirm everything is fine!
    message.reply({content: `${key} successfully edited to ${joinedValue}`});
  } else
  
  // Resets a key to the default value
  if (action === "del" || action === "reset") {
    if (!key) return message.reply({content: "Please specify a key to reset."});
    if (!defaults[key]) return message.reply({content: "This key does not exist in the settings"});
    if (!overrides[key]) return message.reply({content: "This key does not have an override and is already using defaults."});
    
    // Good demonstration of the custom awaitReply method in `./modules/functions.js` !
    const response = await client.awaitReply(message, `Are you sure you want to reset ${key} to the default value?`);

    // If they respond with y or yes, continue.
    if (["y", "yes"].includes(response.toLowerCase())) {
      // We delete the `key` here.
      client.settings.delete(message.guild.id, key);
      message.reply({content: `${key} was successfully reset to default.`});
    } else
    // If they respond with n or no, we inform them that the action has been cancelled.
    if (["n","no","cancel"].includes(response)) {
      message.reply({content: `Your setting for \`${key}\` remains at \`${settings[key]}\``});
    }
  } else
  
  if (action === "addvalue") {
    if (!key) return message.reply({content: "Please specify a key to add value to."});
    if (!defaults[key]) return message.reply({content: "This key does not exist in the settings"});
    if (!overrides[key]) overrides[key] = defaults[key] ; // workaround
    if (! Array.isArray (overrides[key])) return message.reply({content: "This key does not have multiple values."});
    let oldArray = overrides [key] ;
    const joinedValue = value.join(" ");
    oldArray.push (joinedValue) ;
    client.settings.set(message.guild.id, oldArray, key) ;
    //console.log (client.settings.get(message.guild.id) [key]) ;
    message.reply ({content: `${joinedValue} successfully added to ${key}`}) ;
  } else
  
  if (action === "delvalue") {
    if (!key) return message.reply({content: "Please specify a key to delete value to."});
    if (!defaults[key]) return message.reply({content: "This key does not exist in the settings"});
    if (!overrides[key]) overrides[key] = defaults[key] ; // workaround
    if (! Array.isArray (overrides[key])) return message.reply({content: "This key does not have multiple values."});
    let oldArray = overrides [key] ;
    const joinedValue = value.join(" ");
    oldArray.removeItem (joinedValue) ;
    client.settings.set(message.guild.id, oldArray, key) ;
    // console.log (client.settings.get(message.guild.id) [key]) ;
    message.reply ({content: `${joinedValue} successfully deleted from ${key}`}) ;
  } else
  
  if (action === "rate") {
    if (!key) return message.reply({content: "Please specify a rate to edit."});
    //if (!defaults[key]) return message.reply({content: "This rate does not exist in the settings"});
    //if (!overrides[key]) return message.reply({content: "This rate does not have an override and is using defaults."});
    const joinedValue = value.join(" ");
    if (Number.isNaN (joinedValue)) return message.reply ({content: `Value ${joinedValue} for rate is not a number.`}) ;
    let oldValue = null ;
    if (    (key === "common")
         || (key === "uncommon")
         || (key === "rare")
         || (key === "epic")
       ) {
      let itemRate = client.settings.get(message.guild.id) ["itemRate"] ;
      if (!itemRate) {
        console.log ("No itemRate ! Redefine !") ;
        // console.log (defaults ['itemRate'])
        itemRate = defaults ['itemRate'] ;
      }
      itemRate [key] = joinedValue ;
      client.settings.set(message.guild.id, itemRate, "itemRate") ;
      let total = 0 ;
      for (let key in itemRate) {
        total+= Number.parseInt (itemRate [key]);
      }
      if (total !== 100) message.reply ({content: `The total value for itemRate is ${total}%, it may produce unexpected result !`}) ;
    } else
    if (    (key === "high")
         || (key === "regular")
         || (key === "low")
         || (key === "event")
       ) {
      let characterRate = client.settings.get(message.guild.id) ["characterRate"] ;
      if (!characterRate) {
        console.log ("No characterRate ! Redefine !") ;
        // console.log (defaults ['characterRate'])
        characterRate = defaults ['characterRate'] ;
      }
      characterRate [key] = joinedValue ;
      client.settings.set(message.guild.id, characterRate, "characterRate") ;
      let total = 0 ;
      for (let key in characterRate) {
        total+= Number.parseInt (characterRate [key]);
      }
      if (total !== 100) message.reply ({content: `The total value for characterRate is ${total}%, it may produce unexpected result !`}) ;
    } else {
      return message.reply({content: `${key} is not a valid value.`}) ;
    }
    // client.settings.set(message.guild.id, oldArray, key) ;
    // console.log (client.settings.get(message.guild.id) [key]) ;
    message.reply ({content: `${key} successfully set to ${joinedValue}`}) ;
  } else
  
  if (action === "get") {
    if (!key) return message.reply({content: "Please specify a key to view"});
    if (!defaults[key]) return message.reply({content: "This key does not exist in the settings"});
    const isDefault = !overrides[key] ? "\nThis is the default global default value." : "";
    message.reply({content: `The value of ${key} is currently ${settings[key]}${isDefault}`});
  } else {
    // Otherwise, the default action is to return the whole configuration;
    const array = [];
    Object.entries(settings).forEach(([key, value]) => {
      if (typeof value === "object" && !Array.isArray (value)) value = JSON.stringify(value);
      array.push(`${key}${" ".repeat(20 - key.length)}::  ${value}`); 
    });
    await message.channel.send({content: Formatters.codeBlock("asciidoc", `= Current Guild Settings =\n${array.join("\n")}`)});
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["setting", "settings", "conf"],
  permLevel: "Moderator"
};

exports.help = {
  name: "set",
  category: "System",
  description: "View or change settings for your server.",
  usage: "set <view/get/edit/addvalue/delvalue/rate> <key> <value>"
};
