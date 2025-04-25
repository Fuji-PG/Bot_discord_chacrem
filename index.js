const { joinVoiceChannel, createAudioPlayer, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { Client, GatewayIntentBits } = require('discord.js');
const { createAudioResourceWithVolume } = require('./utils');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const connections = new Map();      // สำหรับเก็บ VoiceConnection
const players = new Map();          // สำหรับเก็บ AudioPlayer
const currentSoundMap = new Map();  // สำหรับเก็บชื่อไฟล์เสียงปัจจุบัน

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const guildId = message.guild?.id;

  // !leave
  if (message.content === '!leave') {
    const connection = connections.get(guildId);
    if (!connection) return message.reply('❗ บอทยังไม่ได้เข้าห้องเสียง');

    connection.destroy();
    connections.delete(guildId);
    players.delete(guildId);
    currentSoundMap.delete(guildId);
    return message.reply('👋 บอทออกจากห้องเสียงเรียบร้อยแล้ว');
  }

  // !join
  if (message.content === '!join') {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) return message.reply('❗ กรุณาเข้าห้องเสียงก่อนใช้คำสั่งนี้');

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    } catch (error) {
      console.error('❌ Voice connection failed:', error);
      return message.reply('ไม่สามารถเข้าห้องเสียงได้ครับ 😢');
    }

    const player = createAudioPlayer();
    connection.subscribe(player);

    connections.set(guildId, connection);
    players.set(guildId, player);
    currentSoundMap.set(guildId, 'creamnarak.mp3');

    const playVoice = () => {
      const soundFile = currentSoundMap.get(guildId) || 'creamnarak.mp3';
      const resource = createAudioResourceWithVolume(soundFile, 0.6);
      player.play(resource);
      currentSoundMap.set(guildId, 'creamnarak.mp3'); // reset ไปเสียงหลัก
    };

    playVoice(); // เล่นรอบแรก
    setInterval(playVoice, 15 * 60 * 1000); // ทุก 15 นาที

    return message.reply('✅ เข้าห้องเสียงและจะพูดว่า "ครีมน่ารัก" ทุก 15 นาที');
  }

  // !play, !play1-5
  const soundCommands = {
    '!play': 'https://github.com/Fuji-PG/Bot_discord_chacrem/releases/download/music/creamnarak.mp3',
    '!play1': 'https://github.com/Fuji-PG/Bot_discord_chacrem/releases/download/music/chacrem2.mp3',
    '!play2': 'https://github.com/Fuji-PG/Bot_discord_chacrem/releases/download/music/chacrem3.mp3',
    '!play3': 'https://github.com/Fuji-PG/Bot_discord_chacrem/releases/download/music/ew1.mp3',
    '!play4': 'https://github.com/Fuji-PG/Bot_discord_chacrem/releases/download/music/ew2.mp3',
    '!play5': 'https://github.com/Fuji-PG/Bot_discord_chacrem/releases/download/music/ew3.mp3',
  };

  if (soundCommands[message.content]) {
    const player = players.get(guildId);
    const connection = connections.get(guildId);
    if (!player || !connection) {
      return message.reply('❗ ต้องพิมพ์ !join ให้บอทเข้าห้องก่อนนะ');
    }

    const soundFile = soundCommands[message.content];
    const resource = createAudioResourceWithVolume(soundFile, 0.6);
    player.play(resource);
    currentSoundMap.set(guildId, 'creamnarak.mp3'); // reset กลับเสียงหลัก
    return message.reply(`🔊 เล่นเสียง: ${soundFile}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
