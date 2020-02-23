'use strict';

import '../popup.html';
import '../style.less';

import Vue from 'vue';
import debounce from 'lodash.debounce';
import Settings from './Settings';
import TwitchAPI from './TwitchAPI';

let topGames = [];

const vm = new Vue({
  el: '#app',
  data: {
    isDisabled: false,
    gameList: [],
    preferredGame: null,
    isDropdownOpen: false,
    hovered: 0
  },
  methods: {
    dropdownNavigation (e) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.hovered > 0) {
          this.hovered -= 1;
          scroll();
        }
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.hovered < this.gameList.length - 1) {
          this.hovered += 1;
          scroll();
        }
      }

      if (e.key === 'Enter') {
        this.preferredGame = this.gameList[this.hovered];
        this.isDropdownOpen = false;
        e.target.blur();
      }
    },

    dropdownOpen() {
      this.gameList = topGames;
      this.hovered = 0;
      this.isDropdownOpen = true;
    },

    autocomplete: debounce(function (e) {
      if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) return;

      if (!this.preferredGame) {
        this.gameList = topGames;
        this.hovered = 0;
        return;
      }

      TwitchAPI.searchGames(this.preferredGame)
        .then(result => {
          if (this.preferredGame) {
            this.gameList = result;
            this.hovered = 0;
          }
        })
        .catch(console.error);
    }, 250)
  }
});

vm.$watch('isDisabled',    newVal => Settings.setDisabled(newVal));
vm.$watch('preferredGame', newVal => Settings.setPreferredGame(newVal));

Settings.getDisabled()
  .then(value => (vm.isDisabled = value));

Settings.getPreferredGame()
  .then(value => (vm.preferredGame = value));

TwitchAPI.getGameList()
  .then(data => {
    data.unshift('Auto');
    topGames = data;
  })
  .catch(console.error);

function scroll () {
  const dropdown = document.querySelector('.dropdown'),
    dropdownTop = dropdown.scrollTop,
    dropdownBottom = dropdownTop + dropdown.offsetHeight,
    itemHeight = dropdown.children[vm.hovered].offsetHeight;

  let itemPosition = 0;

  for (let i = 0; i < vm.hovered; i++) {
    itemPosition += dropdown.children[i].offsetHeight;
  }

  if (itemPosition < dropdownTop) {
    dropdown.scrollTop = itemPosition;
  }

  if (itemPosition >= dropdownBottom) {
    dropdown.scrollTop = dropdownTop + itemHeight;
  }
}
