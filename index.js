/*
  A discord bot - bteam helper bot
*/
//https://discordapp.com/api/oauth2/authorize?client_id=xxxxxxxxxxx&permissions=268774464&scope=bot
const _ = require('lodash');
// Import the discord.js module
const Discord = require('discord.js');

// Create an instance of a Discord client
const client = new Discord.Client();
const sql = require('sqlite');
sql.open('./skins.sqlite');
require('dotenv').config();

const roleCMD = require('./commands/role');
const rolesCMD = require('./commands/roles');

// The token of your bot - https://discordapp.com/developers/applications/me
const token = process.env.DISCORD_TOKEN;
//client id of the bot to put a maker against other roles.
const clientId = process.env.DISCORD_CLIENT_ID;

// bot is ready - do it!
client.on('ready', () => {
  console.log(
    `Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${
      client.guilds.size
    } guilds.`
  );
  client.user.setGame(`on ${client.guilds.size} servers`);
});

const prefix = '!';

//Ready Messages
client.on('message', msg => {
  const prefix = '!';
  // Exit and stop if prefix is not there  // Ignore bots.
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  if (msg.channel.type === 'dm') return; //Ignore all DM's

  //handle args into commands
  const args = msg.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);

  //set command
  const command = args.shift().toLowerCase();

  //Role command
  if (command === 'join') {
    // roleCMD(client, msg, args);
    sql
      .get(`SELECT * FROM users WHERE discordId = "${msg.author.id}"`)
      .then(row => {
        console.log(row, 'data?');
        const message = `you've already joined! Create your Org with !createorg organization_name`;
        msg.reply(message);
      })
      .catch(err => {
        console.log(err, 'asd');
        sql
          .run(
            'CREATE TABLE IF NOT EXISTS users (uid INTEGER PRIMARY KEY AUTOINCREMENT, discordId INTEGER)'
          )
          .then(() => {
            sql.run('INSERT INTO users (discordId) VALUES (?)', [msg.author.id]);
          });
      });
  }

  if (command === 'createorg') {
    // roleCMD(client, msg, args);
    sql
      .get(
        `SELECT users.discordId, orgId, name FROM users LEFT JOIN organizations ON organizations.ownerId = users.discordId WHERE users.discordId = ${
          msg.author.id
        }`
      )
      .then(row => {
        console.log(row, 'data?');
      })
      .catch(err => {
        console.log(err, 'asd');
        sql
          .run(
            'CREATE TABLE IF NOT EXISTS organizations (orgId INTEGER PRIMARY KEY AUTOINCREMENT, ownerId INTEGER, name text)'
          )
          .then(() => {
            sql.run('INSERT INTO organizations (ownerId, name) VALUES (?, ?)', [
              msg.author.id,
              'test name',
            ]);
          });
      });
  }

  if (command === 'getsouls') {
    // roleCMD(client, msg, args);
    // `SELECT souls.name, souls.soulId FROM souls LEFT JOIN organizations ON organizations.orgId = souls.orgId AND organizations.ownerId = 107363590914211840`
    sql
      .all(
        `SELECT DISTINCT souls.soulId, souls.name , organizations.name AS orgName, souls.orgId, ownerId FROM 'organizations' LEFT JOIN 'souls' ON souls.orgId WHERE organizations.ownerId = ${
          msg.author.id
        };`
      )
      .then(row => {
        console.log(row, 'souls?');
      })
      .catch(err => {
        console.log(err, 'asd');
        sql
          .run(
            'CREATE TABLE IF NOT EXISTS souls (soulId INTEGER PRIMARY KEY AUTOINCREMENT, orgId INTEGER, name text)'
          )
          .then(() => {
            sql.run('INSERT INTO souls (orgId, name) VALUES (?, ?)', [1, 'test soul name']);
          });
      });
  }
});

// CREATE TABLE Users (
// 	uid integer PRIMARY KEY AUTOINCREMENT,
// 	discordId integer
// );

// CREATE TABLE organizations (
// 	orgId integer PRIMARY KEY AUTOINCREMENT,
// 	ownerId integer,
// 	name text
// );

// CREATE TABLE souls (
// 	soulId integer PRIMARY KEY AUTOINCREMENT,
// 	orgId integer,
// 	name text
// );

//Login the bot
client.login(token);

//ERROR HANDLING
// client.on('error', e => console.error(e));
// client.on('warn', e => console.warn(e));
// client.on('debug', e => console.info(e));
