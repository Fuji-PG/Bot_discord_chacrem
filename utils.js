const { createAudioResource, StreamType } = require('@discordjs/voice');
const prism = require('prism-media');
const https = require('https');

function createAudioResourceWithVolume(urlOrPath, volume = 1.0) {
  const isRemote = urlOrPath.startsWith('http');

  const inputStream = isRemote
    ? https.get(urlOrPath, (res) => res)
    : require('fs').createReadStream(urlOrPath);

  const ffmpeg = require('fluent-ffmpeg');
  const ffmpegPath = require('ffmpeg-static');
  ffmpeg.setFfmpegPath(ffmpegPath);

  const ffmpegStream = ffmpeg(inputStream)
    .audioFilters(`volume=${volume}`)
    .format('s16le')
    .audioFrequency(48000)
    .audioChannels(2)
    .audioCodec('pcm_s16le')
    .pipe();

  const opusStream = ffmpegStream.pipe(new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 }));

  return createAudioResource(opusStream, { inputType: StreamType.Opus });
}

module.exports = { createAudioResourceWithVolume };
