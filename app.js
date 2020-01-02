const Discord = require('discord.js');
const encode = require('strict-uri-encode');
const bot = new Discord.Client();
const moment = require('moment');
const ytdl = require('ytdl-core');
const superagent = require('superagent')
require("moment-duration-format");

const prefix = 'e!'

bot.on('message', message => {

      let msg = message.content.toLowerCase();
      let sender = message.author;

      if (msg === prefix + 'ping') {
          message.channel.send(':ping_pong: | **Pong!** ' + Math.round(bot.ping) + ' ms!')
      }
      if (msg === prefix + 'help') {
          message.channel.send(`
__**Help**__
You are currently looking at the help section which includes all of the commands that you will be able to see

__**📖 General Commands**__
- **e!userinfo** - Shows your simple user information
- **e!serverinfo** - Shows the server information
- **e!ping** - Reveals the ping count
- **e!invite** - Displays the invite link to invite me
- **e!support** - Links the support server
- **e!report** - Use this command to report members

__**🏹 Fun Commands**__
- **e!coinflip** - Flips a coin either heads or tales
- **e!add** - Math calculations
- **e!lmgtfy** - Shows an LMGTFY link supplied by text

__**⚙️ Moderation Commands**__
- **e!kick** - Mention somebody to kick
- **e!ban** - Mention somebody to kick

**NOTE:** I am relatively new which means I am still currently being developed`)

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

          let kickEmbed = new Discord.RichEmbed()
          .setDescription("[KICK]")
          .setColor('#0095ff')
          .addField("Kicked User", `${kUser} with ID ${kUser.id}`)
          .addField("Kicked By", `<@${message.author.id}> with ID ${message.author.id}`)
          .addField("Kicked In", message.channel)
          .addField("Time", message.createdAt)
          .addField("Reason", kReason);

          let kickChannel = message.guild.channels.find(`name`, "🚨mod-log")
          if(!kickChannel) return message.channel.send("Can't find the channel ''🚨mod-log'")

          message.guild.member(kUser).kick(kReason);
          kickChannel.send(kickEmbed);

          return;
      }

      if (message.content.startsWith(prefix + 'report')) {
          let messageArray = message.content.split(" ");
          let args = messageArray.slice(1);
          let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
          let reason = args.join(" ").slice(22);

          let reportEmbed = new Discord.RichEmbed()
          .setDescription("New Report")
          .setColor("#FF0000")
          .addField("Reported User", `${rUser} with ID: ${rUser.id}`)
          .addField("Reported By", `${message.author} with ID: ${message.author.id}`)
          .addField("Channel", message.channel)
          .addField("Time", message.createdAt)
          .addField("Reason", reason);

          let reportchannel = message.guild.channels.find(`name`, "📝reports");

          message.delete().catch(O_o=>{});
          reportchannel.send(reportEmbed);

          return;

      }


      if (message.content.startsWith(prefix + 'ban')) {
          let messageArray = message.content.split(" ");
          let args = messageArray.slice(1);
          let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
          if(!bUser) return message.channel.send("Can't find user!");
          let bReason = args.join(" ").slice(22);
          if(!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send(":warning: | You cannot ban him/her because you do not have the permission to ban members");

          let banEmbed = new Discord.RichEmbed()
          .setDescription("[BAN]")
          .setColor('#0095ff')
          .addField("Banned User", `${bUser} with ID ${bUser.id}`)
          .addField("Banned By", `<@${message.author.id}> with ID ${message.author.id}`)
          .addField("Banned In", message.channel)
          .addField("Time", message.createdAt)
          .addField("Reason", bReason);

          let banChannel = message.guild.channels.find(`name`, "🚨mod-log")
          if(!banChannel) return message.channel.send("Can't find the channel ''🚨mod-log'")

          message.guild.member(bUser).ban(bReason);
          banChannel.send(banEmbed);

          return;
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
      if (message.content.startsWith(prefix + 'invite')) {
          message.channel.send('Invite me here: **https://discordapp.com/oauth2/authorize?client_id=579426425015369750&scope=bot&permissions=2146958847**')
      }
      if (message.content.startsWith(prefix + 'support')) {
          message.channel.send('If you wish to join the server I originate from, the link is here: **https://discord.gg/ypcQaDE**')
      }
 });

 bot.on('ready', () => {
    console.log('Bot is ready with the username: ' + bot.user.username)
    bot.user.setActivity(`e!help | Creator: savage doge`, {type: "PLAYING"})
 });

 bot.login(process.env.BOT_TOKEN);
