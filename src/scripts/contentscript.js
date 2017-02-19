'use strict';

import ChannelManager from './ChannelManager';
import TwitchAPI from './TwitchAPI';
import Settings from './Settings';

let previousUrl = window.location.href;

setTimeout(() => {
  bindOnStreamEnd();

  setInterval(() => {
    const currentUrl = window.location.href;

    if (currentUrl !== previousUrl) {
      bindOnStreamEnd();
      previousUrl = currentUrl;
    }
  }, 5000);
}, 5000);

function bindOnStreamEnd () {
  if (!ChannelManager.isChannel()) return;

  const videoElement = document.querySelector('video');
  if (!videoElement) return;

  console.info('Twitch Auto Switcher: Binding to video element');
  videoElement.addEventListener('ended', onStreamEnd);
}

function onStreamEnd () {
  Settings.getDisabled()
    .then(isDisabled => {
      // Check if extension is disabled
      if (isDisabled) return;

      const currentChannel = ChannelManager.getCurrentChannel();

      return Settings.getPrefferedGame()
        .then(prefferedGame => {
          // If `Auto` then get current game
          if (prefferedGame === 'Auto') {
            return TwitchAPI.getStreamInfo(currentChannel)
              .then(streamInfo => streamInfo.stream ? streamInfo.stream.game : null);
          }
          return prefferedGame;
        })
        .then(game => TwitchAPI.getStreamsByGame(game)) // get stream by games
        .then(streams => streams.filter(stream => stream !== currentChannel)) // remove current channel from list to avoid redirect to the same channel
        .then(streams => streams.length ? streams : TwitchAPI.getFeaturedStreams()) // if no streams take featured list
        .then(streams => streams.filter(stream => stream !== currentChannel)) // remove current channel again
        .then(streams => ChannelManager.setCurrentChannel(streams[0])); // redirect to next stream
    })
    .catch(console.error);
}

