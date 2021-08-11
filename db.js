const csv = require('csv-parser');
const fs = require('fs');
const process = require('process');

const config = require("./config.js");
const mysql = require('mysql2');

const connection = mysql.createConnection(config.mysqlConnection);

connection.execute ("TRUNCATE TABLE `wanshitong`.`character` ;", (err, rows) => {
  console.log ("err truncate character:",err) ;
  // console.log ("rows:", rows) ;
}) ;
connection.execute ("TRUNCATE TABLE `wanshitong`.`item` ;", (err, rows) => {
  console.log ("err truncate item:",err) ;
  // console.log ("rows:", rows) ;
}) ;
/*
connection.execute ("drop table `character`;", (err, res) => {console.error ("err drop character", err) ;}) ;
connection.execute ("CREATE TABLE IF NOT EXISTS `character` (`id` INT NOT NULL AUTO_INCREMENT, `serie` VARCHAR(128) NOT NULL, `name` VARCHAR(256) NOT NULL, `image` VARCHAR(256) NOT NULL, `rarity` INT NOT NULL, primary key (`id`)) ;", (err, res) => {console.error ("err create character", err) ;}) ;
connection.execute ("drop table `availability`;", (err, res) => {console.error ("err drop availability", err) ;}) ;
connection.execute ("CREATE TABLE IF NOT EXISTS `availability` (`character_id` INT NOT NULL, `guild_id` BIGINT NOT NULL, `is_available` SMALLINT NOT NULL DEFAULT 0, primary key (`character_id`, `guild_id`)) ;", (err, res) => {console.error ("err create availablity", err) ;}) ;
*/
//throw '' ;
// 494812563016777729
/*
connection.execute ("CREATE TABLE IF NOT EXISTS `character` (`id` INT NOT NULL AUTO_INCREMENT, `serie` VARCHAR(128) NOT NULL, `name` VARCHAR(256) NOT NULL, `image` VARCHAR(256) NOT NULL, `rarity` INT NOT NULL, `guild_id` BIGINT NOT NULL, primary key (`id`)) ;", (err, res) => {console.error ("err create character", err) ;}) ;
connection.execute ("CREATE TABLE IF NOT EXISTS `item` (`id` INT NOT NULL AUTO_INCREMENT, `name` VARCHAR (256) NOT NULL, `rarity` INT NOT NULL, `character_id` INT NOT NULL, `guild_id` BIGINT NOT NULL, primary key (`id`)) ;", (err, res) => {console.error ("err create item", err) ;}) ;
connection.execute ("CREATE TABLE IF NOT EXISTS `inventory` (`owner_id` BIGINT NOT NULL, `item_id` INT NOT NULL, `guild_id` BIGINT NOT NULL, primary key (`owner_id`, `item_id`, `guild_id`)) ;", (err, res) => {console.error ("err create inventory", err) ;}) ;
connection.execute ("CREATE TABLE IF NOT EXISTS `availability` (`character_id` INT NOT NULL, `guild_id` BIGINT NOT NULL, `is_available` SMALLINT NOT NULL DEFAULT 0, primary key (`character_id`, `guild_id`)) ;", (err, res) => {console.error ("err create availablity", err) ;}) ;
-- character
CREATE TABLE IF NOT EXISTS `character` (`id` INT NOT NULL AUTO_INCREMENT, `serie` VARCHAR(128) NOT NULL, `name` VARCHAR(256) NOT NULL, `image` VARCHAR(256) NOT NULL, `rarity` INT NOT NULL, primary key (`id`)) ;
-- item
CREATE TABLE IF NOT EXISTS `item` (`id` INT NOT NULL AUTO_INCREMENT, `name` VARCHAR (256) NOT NULL, `rarity` INT NOT NULL, `character_id` INT NOT NULL, `guild_id` BIGINT NOT NULL, primary key (`id`)) ;
-- inventory
CREATE TABLE IF NOT EXISTS `inventory` (`owner_id` BIGINT NOT NULL, `item_id` INT NOT NULL, `guild_id` BIGINT NOT NULL, primary key (`owner_id`, `item_id`, `guild_id`)) ;
-- availability
CREATE TABLE IF NOT EXISTS `availability` (`character_id` INT NOT NULL, `guild_id` BIGINT NOT NULL, `is_available` SMALLINT NOT NULL DEFAULT 0, primary key (`character_id`, `guild_id`)) ;
*/
fs.createReadStream('wst.csv')
  .pipe(csv())
  .on('data', (row) => {
     const   name = row ["Perso"]
           , set = row ["serie"]
           , image = row ["URL image"]
           , rarity = getRarityCharacter (row ["classe"])
           , itemCommon = row ["Commun"]
           , itemUncommon = row ["Non-commun"]
           , itemRare = row ["Rare"]
           , itemEpic = row ["Épique"]
           , current = row ["#"]
           ;
     // console.log (`${name} => ${name.trim().length}`)
     if (name.trim().length)
       connection.execute ("insert into wanshitong.`character` (name, serie, image, rarity) values (?, ?, ?, ?) ;", [name, set, image, rarity], (err, res) => {
         //console.log (res) ;
         if (err) return console.error ("err character "+current, err) ;
         const character_id = res.insertId ;
         /*
         console.log ("itemCommon:", itemCommon)
         console.log ("itemUncommon:", itemUncommon)
         console.log ("itemRare:", itemRare)
         console.log ("itemEpic:", itemEpic)
         console.log ("character_id:", character_id)
         console.log ("guild_id:", guild_id)
         */
         connection.execute ("insert into wanshitong.`item` (name, rarity, character_id) values (?, 1, ?) ;", [itemCommon, character_id], (err, res) => {console.error ("err common "+current, err) ;}) ;
         connection.execute ("insert into wanshitong.`item` (name, rarity, character_id) values (?, 2, ?) ;", [itemUncommon, character_id], (err, res) => {console.error ("err unco "+current, err) ;}) ;
         connection.execute ("insert into wanshitong.`item` (name, rarity, character_id) values (?, 3, ?) ;", [itemRare, character_id], (err, res) => {console.error ("err rare "+current, err) ;}) ;
         connection.execute ("insert into wanshitong.`item` (name, rarity, character_id) values (?, 4, ?) ;", [itemEpic, character_id], (err, res) => {console.error ("err epic "+current, err) ;}) ;
       }) ;
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

/*
fs.createReadStream('wst_avril.csv')
  .pipe(csv())
  .on('data', (row) => {
     const   name = row ["Perso"]
           , set = row ["serie"]
           , image = row ["URL image"]
           , rarity = getRarityCharacter (row ["classe"])
           , itemCommon = row ["Commun"]
           , itemUncommon = row ["Non-commun"]
           , itemRare = row ["Rare"]
           , itemEpic = row ["Épique"]
           , current = row ["#"]
           , available = (rarity !=4)
           ;
     // console.log (`${name} => ${name.trim().length}`)
     if (name.trim().length)
     connection.execute ("insert into wanshitong.`character` (name, serie, image, rarity) values (?, ?, ?, ?) ;", [name, set, image, rarity], (err, res) => {
         //console.log (res) ;
          if (err) return console.error ("err character "+current, err) ;
         const character_id = res.insertId ;
         //
         console.log ("itemCommon:", itemCommon)
         console.log ("itemUncommon:", itemUncommon)
         console.log ("itemRare:", itemRare)
         console.log ("itemEpic:", itemEpic)
         console.log ("character_id:", character_id)
         console.log ("guild_id:", guild_id)
         //
         connection.execute ("insert into wanshitong.`item` (name, rarity, character_id) values (?, 1, ?) ;", [itemCommon, character_id], (err, res) => {console.error ("err common "+current, err) ;}) ;
         connection.execute ("insert into wanshitong.`item` (name, rarity, character_id) values (?, 2, ?) ;", [itemUncommon, character_id], (err, res) => {console.error ("err unco "+current, err) ;}) ;
         connection.execute ("insert into wanshitong.`item` (name, rarity, character_id) values (?, 3, ?) ;", [itemRare, character_id], (err, res) => {console.error ("err rare "+current, err) ;}) ;
         connection.execute ("insert into wanshitong.`item` (name, rarity, character_id) values (?, 4, ?) ;", [itemEpic, character_id], (err, res) => {console.error ("err epic "+current, err) ;}) ;
       }) ;
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
  */
  
function getRarityCharacter (rarity) {
  return ["high", "regular", "low", "event"].indexOf (rarity)+1 ;
}