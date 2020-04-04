<template>
  <div v-on:click="isDropdownOpen = false">
    <div class="section section--justify">
      <label for="enabled">{{ translate('enabledLabel') }}</label>
      <div class="tws-toggle">
        <input id="enabled" v-model="isEnabled" type="checkbox" class="tws-toggle__input" />
        <label for="enabled" class="tws-toggle__button"></label>
      </div>
    </div>

    <hr />

    <div class="section" v-bind:class="{ 'section--disabled': !isEnabled }">
      <label>{{ translate('nextTargetLabel') }}</label>
      <button
        class="tws-button tws-button--large tws-button--wide tws-button--dropdown mg-t-1"
        v-bind:class="[isDropdownOpen ? 'tws-button--primary' : 'tws-button--secondary']"
        v-bind:disabled="!isEnabled"
        v-on:click.stop="toggleDropdown"
      >
        <span class="flex-grow ellipsis">{{ nextTarget ? translateNextTarget(nextTarget) : '' }}</span>
        <div
          class="tws-button__icon tws-button__icon--dropdown"
          v-bind:class="{ 'tws-button__icon--dropdown-open': isDropdownOpen }"
        >
          <svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
            <g>
              <path d="M14.5 6.5L10 11 5.5 6.5 4 8l6 6 6-6-1.5-1.5z" />
            </g>
          </svg>
        </div>
      </button>
      <div v-if="isDropdownOpen" class="dropdown" v-on:click.stop>
        <div class="relative mg-b-1">
          <div class="tws-input__icon tws-input__icon--left">
            <svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
              <g>
                <path
                  fill-rule="evenodd"
                  d="M13.192 14.606a7 7 0 111.414-1.414l3.101 3.1-1.414 1.415-3.1-3.1zM14 9A5 5 0 114 9a5 5 0 0110 0z"
                  clip-rule="evenodd"
                />
              </g>
            </svg>
          </div>
          <div
            v-if="searchValue && !isLoading"
            class="tws-input__icon tws-input__icon--right tws-input__icon--action"
            v-on:click.prevent="resetInput"
          >
            <svg width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
              <g>
                <path
                  d="M8.5 10L4 5.5 5.5 4 10 8.5 14.5 4 16 5.5 11.5 10l4.5 4.5-1.5 1.5-4.5-4.5L5.5 16 4 14.5 8.5 10z"
                />
              </g>
            </svg>
          </div>
          <div v-if="isLoading" class="tws-input__icon tws-input__icon--right tws-spinner">
            <svg viewBox="22 22 44 44">
              <circle cx="44" cy="44" r="19.5" stroke-width="5" />
            </svg>
          </div>
          <input
            id="search-input"
            v-model="searchValue"
            type="text"
            class="tws-input tws-input--large pd-l-36 pd-r-36"
            placeholder="Search"
            spellcheck="false"
            autocomplete="false"
            autocapitalize="off"
            autocorrect="off"
            v-on:keydown="navigate"
            v-on:input="debouncedSearch"
          />
        </div>

        <div class="dropdown__container" v-on:mouseleave="hover(-1)">
          <div v-for="(section, title) in groupedList" v-bind:key="title" class="dropdown__section">
            <div class="dropdown__section-title">{{ translate(`nextTargetType${title}`) }}</div>
            <div
              v-for="item in section"
              v-bind:key="item.value"
              v-bind:class="{ 'dropdown__section-item_hover': isHovered(item.id) }"
              class="dropdown__section-item ellipsis"
              v-on:mousemove="hover(item.id)"
              v-on:click="selectNext(item.id)"
            >
              {{ translateNextTarget(item) }}
            </div>
          </div>
        </div>
        <div v-if="searchValue && !list.length" class="dropdown__no-results">{{ translate('noResults') }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import debounce from 'lodash.debounce';
import { UserSettings } from '../libs/user-settings';
import { TwitchAPI } from '../libs/twitch-api';
import { NextTargetList, NextTarget, NextTargetGroupedList, NextTargetType } from '../types/next-target.interface';
import { buildInitialList, groupByType, buildList } from './utils/list.util';
import { followScroll } from './utils/scroll.util';

@Component
export default class App extends Vue {
  public isEnabled = false;
  public isDropdownOpen = false;
  public isLoading = false;
  public searchValue = '';
  public defaultList: NextTargetList = [];
  public list: NextTargetList = [];
  public groupedList: NextTargetGroupedList | null = null;
  public nextTarget: NextTarget | null = null;
  public hoveredIndex = -1;

  public debouncedSearch = debounce(this.search, 250);

  @Watch('isEnabled')
  public async onIsEnabledChanged() {
    await UserSettings.setEnabled(this.isEnabled);
  }

  public async created() {
    this.isLoading = true;
    try {
      this.isEnabled = await UserSettings.isEnabled();
      this.nextTarget = await UserSettings.getNextTarget();
      const topCategories = await TwitchAPI.getTopCategories();
      this.defaultList = buildInitialList(topCategories);
      this.resetList();
    } catch (err) {
      console.error('Encountered error on initialization', err);
    } finally {
      this.isLoading = false;
    }
  }

  public translate(key: string) {
    return browser.i18n.getMessage(key);
  }

  public translateNextTarget(nextTarget: NextTarget) {
    return nextTarget.type === NextTargetType.Common
      ? this.translate(`commonOption${nextTarget.value}`)
      : nextTarget.value;
  }

  public toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.resetInput();
    }
  }

  public async selectNext(index: number) {
    if (this.list[index]) {
      this.nextTarget = this.list[index];
      await UserSettings.setNextTarget(this.nextTarget);
      this.closeDropdown();
    }
  }

  public hover(index: number) {
    this.hoveredIndex = index;
  }

  public isHovered(index: number) {
    return this.hoveredIndex === index;
  }

  public navigate(event: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
      event.preventDefault();
    }
    if (event.key === 'ArrowUp' && this.hoveredIndex > 0) {
      this.hoveredIndex -= 1;
      this.highlightSelection();
      this.followScroll();
    }
    if (event.key === 'ArrowDown' && this.hoveredIndex < this.list.length - 1) {
      this.hoveredIndex += 1;
      this.highlightSelection();
      this.followScroll();
    }
    if (event.key === 'Enter') {
      this.selectNext(this.hoveredIndex);
    }
  }

  private resetInput() {
    this.searchValue = '';
    this.resetList();
    this.focusInput();
  }

  private resetList() {
    this.list = [...this.defaultList];
    this.groupByType();
  }

  private focusInput() {
    setTimeout(() => document.querySelector<HTMLInputElement>('#search-input')?.focus());
  }

  private closeDropdown() {
    this.isDropdownOpen = false;
  }

  private groupByType() {
    this.groupedList = groupByType(this.list);
    this.hoveredIndex = -1;
  }

  private followScroll() {
    const dropdownElement = document.querySelector<HTMLDivElement>('.dropdown__container'),
      itemElement = document.querySelectorAll<HTMLDivElement>('.dropdown__section-item')[this.hoveredIndex];

    if (dropdownElement && itemElement) {
      followScroll(dropdownElement, itemElement, this.hoveredIndex);
    }
  }

  private highlightSelection() {
    const hoveredNextTarget = this.list[this.hoveredIndex];
    if (hoveredNextTarget && hoveredNextTarget.type !== NextTargetType.Common) {
      this.searchValue = hoveredNextTarget.value;
    }
  }

  private async search() {
    if (!this.searchValue) {
      this.resetList();
    } else {
      this.isLoading = true;
      try {
        const categories = await TwitchAPI.searchCategories(this.searchValue);
        this.list = buildList(categories);
        this.groupByType();
      } catch (err) {
        console.error('Error on getting list', err);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style lang="less" src="./styles/index.less"></style>
