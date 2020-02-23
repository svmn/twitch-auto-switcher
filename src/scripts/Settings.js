'use strict';

export default {
  getDisabled () {
    return this.storageGet('disabled');
  },

  setDisabled (disabled) {
    this.storageSet('disabled', disabled);
  },

  getPreferredGame () {
    return this.storageGet('preferredGame')
      .then(preferredGame => preferredGame || 'Auto');
  },

  setPreferredGame (preferredGame) {
    this.storageSet('preferredGame', preferredGame);
  },

  storageGet (key) {
    return new Promise(resolve => {
      chrome.storage.sync.get(key, data => resolve(data[key]));
    });
  },

  storageSet (key, value) {
    chrome.storage.sync.set({ [key]: value });
  }
};
