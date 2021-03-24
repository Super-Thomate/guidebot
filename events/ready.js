module.exports = async client => {
  // Log that the bot is online.
  client.logger.log(`${client.user.tag}, ready to serve ${client.users.cache.size} users in ${client.guilds.cache.size} servers.`, "ready");
  
  // This loop ensures that client.application always contains up to date data
  // about the app's status. This includes whether the bot is public or not,
  // its description, owner(s), etc. Used for the dashboard amongs other things.
  client.application = await client.fetchApplication();
  if (client.owners.length < 1) client.application.team ? client.owners.push(...client.application.team.members.keys()) : client.owners.push(client.application.owner.id);
  setInterval( async () => {
    client.owners = [];
    client.application = await client.fetchApplication();
    client.application.team ? client.owners.push(...client.application.team.members.keys()) : client.owners.push(client.application.owner.id);
  }, 60000);

  // Make the bot "play the game" which is the help command with default prefix.
  // client.user.setActivity(`${client.settings.get("default").prefix}help`, {type: "PLAYING"});
  client.user.setActivity(`Collecting items`, {type: "PLAYING"});
  
  // DATABASE
  /*
  -- character
  CREATE TABLE IF NOT EXISTS `character` (`id` INT NOT NULL AUTO_INCREMENT, `name` VARCHAR(256) NOT NULL, `image` VARCHAR(256) NOT NULL, `rarity` INT NOT NULL, `is_available` SMALLINT NOT NULL DEFAULT 0, primary key (`id`)) ;
  -- item
  CREATE TABLE IF NOT EXISTS `item` (`id` INT NOT NULL AUTO_INCREMENT, `name` VARCHAR (256) NOT NULL, `rarity` INT NOT NULL, `character_id` INT NOT NULL, primary key (`id`)) ;
  -- inventory
  CREATE TABLE IF NOT EXISTS `inventory` (`owner_id` BIGINT NOT NULL, `item_id` INT NOT NULL, `guild_id` BIGINT NOT NULL, primary key (`owner_id`, `item_id`, `guild_id`)) ;
  -- leaderboard
  CREATE TABLE IF NOT EXISTS `gamelb` (`user_id` BIGINT NOT NULL, `items` INT NOT NULL, `complete` SMALLINT NOT NULL DEFAULT 0, `date_completed` DATETIME NULL, `guild_id` BIGINT NOT NULL, primary key (`user_id`, `guild_id`)) ;
  */
  //client.connection.execute ("drop table `character` ;", (err, rows) => {if (err) console.log ("err:",err) ;}) ;
  //client.connection.execute ("drop table `item` ;", (err, rows) => {if (err) console.log ("err:",err) ;}) ;
  client.connection.execute ("CREATE TABLE IF NOT EXISTS `character` (`id` INT NOT NULL AUTO_INCREMENT, `name` VARCHAR(256) NOT NULL, `image` VARCHAR(256) NOT NULL, `rarity` INT NOT NULL, `is_available` SMALLINT NOT NULL DEFAULT 0, primary key (`id`)) ;", (err, rows) => {
    if (err) console.log ("err:",err) ;
  }) ;
  client.connection.execute ("CREATE TABLE IF NOT EXISTS `item` (`id` INT NOT NULL AUTO_INCREMENT, `name` VARCHAR (256) NOT NULL, `rarity` INT NOT NULL, `character_id` INT NOT NULL, primary key (`id`)) ;", (err, rows) => {
    if (err) console.log ("err:",err) ;
  }) ;
  /*
  client.connection.execute ("drop table `inventory` ;", (err, rows) => {
    console.log ("err:",err) ;
  }) ;
  client.connection.execute ("drop table `inventory_event` ;", (err, rows) => {
    console.log ("err:",err) ;
  }) ;
  */
  client.connection.execute ("CREATE TABLE IF NOT EXISTS `inventory` (`owner_id` BIGINT NOT NULL, `item_id` INT NOT NULL, `guild_id` BIGINT NOT NULL, primary key (`owner_id`, `item_id`, `guild_id`)) ;", (err, rows) => {
    if (err) console.log ("err:",err) ;
  }) ;
  client.connection.execute ("CREATE TABLE IF NOT EXISTS `inventory_event` (`owner_id` BIGINT NOT NULL, `item_id` INT NOT NULL, `guild_id` BIGINT NOT NULL, primary key (`owner_id`, `item_id`, `guild_id`)) ;", (err, rows) => {
    if (err) console.log ("err:",err) ;
  }) ;
  /*
  client.connection.execute ("drop table `blacklist` ;", (err, rows) => {
    console.log ("err:",err) ;
  }) ;
  */
  client.connection.execute ("CREATE TABLE IF NOT EXISTS `blacklist` (`user_id` BIGINT NOT NULL, `guild_id` BIGINT NOT NULL, `type` varchar(128) not null, primary key (`user_id`, `guild_id`, `type`)) ;", (err, rows) => {
    if (err) console.log ("err:",err) ;
  }) ;
  /*
  client.connection.execute ("drop table `gamelb` ;", (err, rows) => {
    if (err) console.log ("err:",err) ;
  }) ;
  */
  client.connection.execute ("CREATE TABLE IF NOT EXISTS `gamelb` (`user_id` BIGINT NOT NULL, `items` INT NOT NULL default 1, `complete` SMALLINT NOT NULL DEFAULT 0, `date_completed` DATETIME NULL, `guild_id` BIGINT NOT NULL, primary key (`user_id`, `guild_id`)) ;", (err, rows) => {
    if (err) console.log ("err:",err) ;
  }) ;
  // Table for debug occurance
  client.connection.execute ("CREATE TABLE IF NOT EXISTS `occurance` (`message` BIGINT NOT NULL default 0, `drop` BIGINT NOT NULL default 0, `guild_id` BIGINT NOT NULL, primary key (`guild_id`)) ;", (err, rows) => {
    if (err) console.log ("err:",err) ;
  }) ;
  
  client.connection.execute ("select count (*) as allItems from `item` as A, `character` as B where A.character_id=B.id and B.is_available=1 and B.rarity<>4 ;", (err, rows) => {
    if (err) console.log ("err:",err) ;
    if (rows && rows.length) {
      const allItems = rows [0].allItems ;
      client.maxItem = allItems ;
    }
  });
  
  
};
