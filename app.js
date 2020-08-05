const Discord = require('discord.js');
const encode = require('strict-uri-encode');
const bot = new Discord.Client();
const moment = require('moment');
const ytdl = require('ytdl-core');
const superagent = require('superagent')
const db = require('quick.db');
const readline = require('readline');
require("moment-duration-format");

var express = require('express');
var app = express();
app.get("/", (request, response) => {
    response.sendStatus(200);
});
app.listen(process.env.PORT);

const prefix = 'e!'

bot.on('message', message => {

      let msg = message.content.toLowerCase();
      let sender = message.author;

      if (msg === prefix + 'ping') {
          message.channel.send(':ping_pong: | **Pong!** ' + Math.round(bot.ping) + ' ms!')
      }
      if (msg === prefix + 'help') {
          const embed = new Discord.RichEmbed()
              .setColor('RANDOM')
              .setTitle('Help')
              .setDescription('The commands are categorized into different group e.g moderation.')
              .setTimestamp()
              .addField('e!ping', 'Displays the latency between the server and the bot')
              .addField('e!serverinfo', 'Displays the server information')
              .addField('e!userinfo', 'Displays your user information')
              .addField('e!coinflip', 'Heads or tails?')
              .addField('e!add', 'Mathematical calculations (e.g 1 2 3 4)')
              .addField('e!lmgtfy', 'LMGTFY link (e.g e!lmgtfy Hello World!)')
              .addField('e!8ball', 'Interactive discord 8ball!')
              .addField('e!avatar', 'Displays only your avatar')
              .addField('e!report', 'Use this command to become a snitch and report someone')
              .addField('e!kick', 'Kick somebody')
              .addField('e!ban', 'Ban somebody')
              .addField('e!clear', 'Use this command to purge messages');
        message.channel.send(embed);
       return; 
      }
      if (msg === prefix + 'avatar') {
        let member = message.mentions.users.first();
        var embedAuthor = new Discord.RichEmbed()
            .setTitle('Here is your avatar ' + message.author.username + " :")
            .setImage(message.author.avatarURL)
            .setTimestamp();
        if(!member) return message.channel.send(embedAuthor)
        
        return;
      }
      if (msg === prefix + 'userinfo') {
        let user = message.mentions.users.first() || message.author;

        let userinfo = {};
        userinfo.avatar = user.displayAvatarURL
        userinfo.name = user.username;
        userinfo.discrim = `#${user.discriminator}`
        userinfo.id = user.id;
        userinfo.status = user.presence.status;
        userinfo.registered = moment.utc(message.guild.members.get(user.id).user.createdAt).format("dddd, MMMM Do, YYYY");
        userinfo.joined = moment.utc(message.guild.members.get(user.id).joinedAt).format('dddd, MMMM Do, YYYY')

        const embed = new Discord.RichEmbed()
        .setAuthor(user.tag, userinfo.avatar)
        .setThumbnail(userinfo.avatar)
        .setColor(0xf4427a)
        .addField(`Username`, userinfo.name, true)
        .addField(`Discriminator`, userinfo.discrim, true)
        .addField(`ID`, userinfo.id, true)
        .addField(`Status`, userinfo.status, true)
        .addField(`Registered`, userinfo.registered)
        .addField(`Joined`, userinfo.joined)

        return message.channel.send(embed);
        }
      if (msg === prefix + 'serverinfo') {
          const serverLevel = ["None", "Low", "Medium", "High", "Max"];

          const embed = new Discord.RichEmbed()
          .setAuthor(message.guild.name, message.guild.iconURL)
          .setThumbnail(message.guild.iconURL)
          .setColor('#0094ff')
          .addField(`Owner`, message.guild.owner.user.tag, true)
          .addField(`ID`, message.guild.id, true)
          .addField(`Members`, message.guild.memberCount, true)
          .addField(`Bots`, message.guild.members.filter(mem => mem.user.bot === true).size, true)
          .addField(`Online`, message.guild.members.filter(mem => mem.presence.status != "offline").size, true)
          .addField(`Roles`, message.guild.roles.size, true)
          .addField(`Verification Level`, serverLevel[message.guild.verificationLevel], true)
          .addField(`Creation Date`, moment.utc(message.guild.createdAt).format("dddd, MMMM Do, YYYY"), true)

          return message.channel.send(embed);
      }

      if (message.content.startsWith(prefix + 'kick')) {
          let messageArray = message.content.split(" ");
          let args = messageArray.slice(1);
          let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
          if(!kUser) return message.channel.send("Can't find user!");
          let kReason = args.join(" ").slice(22);
          if(!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send("You cannot kick him/her because you do not have the permission to kick members");
          if(kUser.hasPermission("KICK_MEMBERS")) return message.channel.send("You cannot kick that member!");

          let kickEmbed = new Discord.RichEmbed()
          .setDescription("Kick")
          .setColor('#0095ff')
          .addField("Kicked User", `${kUser} with ID ${kUser.id}`)
          .addField("Kicked By", `<@${message.author.id}> with ID ${message.author.id}`)
          .addField("Kicked In", message.channel)
          .addField("Time", message.createdAt)
          .addField("Reason", kReason);

          let kickChannel = message.guild.channels.find(`name`, "📜earthbot-log")
          if(!kickChannel) return message.channel.send("Can't find the channel 📜earthbot-log")

          message.guild.member(kUser).kick(kReason);
          kickChannel.send(kickEmbed);

          return;
      }
  
      if (message.content.startsWith(prefix + '8ball')) {
          let replies = ['As I see it, yes.',
                         'Ask again later.',
                         'Better not tell you now.',
                         'Cannot predict now.',
                         'Concentrate and ask again.',
                          'Hell no.',
                          'It is certain.',
                          'Hell yes.',
                          'Most likely.',
                          'My reply is no.',
                          'My sources say no.',
                          'Outlook not so good.',
                          'Outlook good.',
                          'Reply hazy, try again.',
                          'Signs point to yes.',
                          'Very doubtful.',
                          'Without a doubt.',
                          'Yes.',
                          'Yes – definitely.',
                          'You may rely on it.']
          
          let result = Math.floor((Math.random() * replies.length) + 0);
        
          message.channel.send(':8ball: | ' + replies[result])
      }

      if (message.content.startsWith(prefix + 'report')) {
          let messageArray = message.content.split(" ");
          let args = messageArray.slice(1);
          let target = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
          let reason = args.slice(1).join(' ');
          let reports = message.guild.channels.find('name', 'manual-reports')
          
          if(!target) return message.channel.send('Please specify a member to report!');
          if(!reason) return message.channel.send('You must include a reason for the report!');
          if(!reports) return message.channel.send('Cannot find the reports channel');
        
          let embed = new Discord.RichEmbed()
              .setColor('RANDOM')
              .setThumbnail(target.user.avatarURL)
              .addField('Reported Member', `${target.user.username} with an ID: ${target.user.id}`)
              .addField('Reported By', `${message.author.username} with an ID: ${message.author.id}`)
              .addField('Reported Time', message.createdAt)
              .addField('Reported In', message.channel)
              .addField('Reported Reason', reason)
              .setFooter('Reported User Information', target.user.displayAvatarURL);
        
        message.channel.send(`${target} has been successfully reported by ${message.author} for ${reason}. Thank you for making this server a better place!`);
        reports.send(embed);

      }


      if (message.content.startsWith(prefix + 'ban')) {
          let messageArray = message.content.split(" ");
          let args = messageArray.slice(1);
          let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
          if(!bUser) return message.channel.send("Can't find user!");
          let bReason = args.join(" ").slice(22);
          if(!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send("You cannot ban the user because you have insufficient permissions to use this command!");
          if(bUser.hasPermission("BAN_MEMBERS")) return message.channel.send("This user cannot be banned!")

          let banEmbed = new Discord.RichEmbed()
          .setDescription("Ban")
          .setColor('#0095ff')
          .setTimestamp()
          .addField("Banned User", `${bUser} with ID ${bUser.id}`)
          .addField("Banned By", `<@${message.author.id}> with ID ${message.author.id}`)
          .addField("Banned In", message.channel)
          .addField("Time", message.createdAt)
          .addField("Reason", bReason);

          let banChannel = message.guild.channels.find(`name`, "bot-log")
          if(!banChannel) return message.channel.send("Can't find the channel 'bot-log'")

          message.guild.member(bUser).ban(bReason);
          banChannel.send(banEmbed);

          return;
      }
      
      if (message.content.startsWith(prefix + 'clear')) {
         if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("You must have the ``MANAGE_MESSAGES`` permission!")
         let messageArray = message.content.split(" ");
         let args = messageArray.slice(1);
        
         if(!args[0]) return message.channel.send("You must enter a number!");
         message.channel.bulkDelete(args[0]).then(() => {
           message.channel.send(`Cleared ${args[0]} message(s)`).then(message => message.delete(5000));
         });
      }
  
      if (message.content.startsWith(prefix + 'coinflip')) {
          var chance = Math.floor(Math.random() * 2);
          if(chance == 0) {
            message.reply('You tossed a coin and it landed on **Heads**')
          }
          else {
            message.reply('You tossed a coin and it landed on **Tails**')
          }
      }
      if (message.content.startsWith(prefix + 'add')) {
          let args = message.content.split(" ").slice(1);
          let numArray = args.map(n=> parseInt(n));

          if (!args[0]) return message.channel.send('Please input a calculation');
          let total = numArray.reduce( (p, c) => p+c);


          message.channel.sendMessage(total);
      }
      if (message.content.startsWith(prefix + 'lmgtfy')) {
        let args = message.content.split(" ").slice(1);
        let question = encode(args.join(' '));
        let link = `https://www.lmgtfy.com/?q=${question}`;

        message.channel.send(`**<${link}>**`)
      }
 });

bot.on('ready', () => {
  function randomStatus() {
    let status = ["COVID-19", "CoronaEarth", "e!help", "Nothing", "MINECRAFT", "FORTNITE"]
    let rstatus = Math.floor(Math.random() * status.length);
    bot.user.setActivity(status[rstatus], {type: "PLAYING",});
  };
  setInterval(randomStatus, 20000)
  console.log('Online.')
});

 bot.login(process.env.TOKEN);
