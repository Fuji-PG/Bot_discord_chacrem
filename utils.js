const { createAudioResource, StreamType } = require('@discordjs/voice');
const prism = require('prism-media');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath); // บอก path ของ ffmpeg-static ให้ fluent-ffmpeg รู้

function createAudioResourceWithVolume(filePath, volume = 1.0) {
  const ffmpegStream = ffmpeg(filePath)
    .audioFilters(`volume=${volume}`)
    .format('s16le')
    .audioFrequency(48000)
    .audioChannels(2)
    .audioCodec('pcm_s16le')
    .pipe();

  const opusStream = ffmpegStream.pipe(new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 }));

  return createAudioResource(opusStream, {
    inputType: StreamType.Opus,
  });
}

module.exports = { createAudioResourceWithVolume };
