'use strict';

import ChannelManager from './ChannelManager';
import TwitchAPI from './TwitchAPI';
import Settings from './Settings';

const INTERVAL = 1000;
let videoElement = null;

async function isStreamEnded(video) {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return video.paused && video.readyState === 2;
}



function connect() {
  if (!ChannelManager.isChannel()) return;

  videoElement = document.querySelector('video');
  if (videoElement) {
    // watch();

    videoElement.addEventListener(
      'pause',
      async () => (await isStreamEnded(videoElement)) && switchToNextStream(),
    );
    console.info('TAS: Connected');
  }
}

window.addEventListener('keyup', event => {
  if (event.key === 'F9') {
    switchToNextStream();
  }
});

function switchToNextStream() {
  Settings.getDisabled()
    .then(isDisabled => {
      // Check if extension is disabled
      if (isDisabled) return;

      const currentChannel = ChannelManager.getCurrentChannel();

      return Settings.getPreferredGame()
        .then(preferredGame => {
          // If `Auto` then get current game
          if (preferredGame === 'Auto') {
            return TwitchAPI.getStreamInfo(currentChannel).then(streamInfo =>
              streamInfo.stream ? streamInfo.stream.game : null,
            );
          }
          return preferredGame;
        })
        .then(game => TwitchAPI.getStreamsByGame(game)) // get stream by games
        .then(streams => streams.filter(stream => stream !== currentChannel)) // remove current channel from list to avoid redirect to the same channel
        .then(streams => (streams.length ? streams : TwitchAPI.getFeaturedStreams())) // if no streams take featured list
        .then(streams => streams.filter(stream => stream !== currentChannel)) // remove current channel again
        .then(streams => ChannelManager.setCurrentChannel(streams[0])); // redirect to next stream
    })
    .catch(console.error);
}

(function watch() {
  if (videoElement !== document.querySelector('video')) {
    connect();
  }

  setTimeout(() => watch(), INTERVAL);
})();
