'use strict';

export default {
  getCurrentChannel () {
    return window.location.href.split('/').pop();
  },

  setCurrentChannel (channel) {
    window.location.href = 'https://www.twitch.tv/' + channel;
  },

  isChannel () {
    return /https:\/\/www\.twitch\.tv\/([a-z0-9_]+)$/.test(window.location.href);
  }
};
