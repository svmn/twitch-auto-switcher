'use strict';

export default {
  getDisabled () {
    return this.storageGet('disabled');
  },

  setDisabled (disabled) {
    this.storageSet('disabled', disabled);
  },

  getPrefferedGame () {
    return this.storageGet('prefferedGame')
      .then(prefferedGame => prefferedGame || 'Auto');
  },

  setPrefferedGame (prefferedGame) {
    this.storageSet('prefferedGame', prefferedGame);
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
