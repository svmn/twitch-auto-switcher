import { TwitchAPI } from './twitch-api';
import { UserSettings } from './user-settings';
import { NextTargetType, CommonOptionValue } from '@/types/next-target.interface';
import { getRandomElement, parseChannelName } from './utils';
import { TwitchDomApi } from './twitch-dom-api';

export class NoContentError extends Error {
  constructor() {
    super("Couldn't determine next stream");
    Object.setPrototypeOf(this, NoContentError.prototype);
  }
}

export class Switcher {
  public static async switch(from: string) {
    const isEnabled = await UserSettings.isEnabled();
    if (!isEnabled) {
      console.info('twitch auto switcher is disabled - not redirecting');
      return;
    }

    try {
      const nextTarget = await UserSettings.getNextTarget();
      switch (nextTarget.type) {
        case NextTargetType.Category: {
          await this.switchToCategory(nextTarget.value, from);
          break;
        }

        case NextTargetType.Common: {
          await this.switchToSpecificOption(nextTarget.value, from);
          break;
        }

        default:
          throw new Error('Unknown next target value');
      }
    } catch (err) {
      if (err instanceof NoContentError) {
        console.info("Couldn't determine next stream - switching to fallback");
        await this.fallback(from);
      }
      throw err;
    }
  }

  private static async switchToSpecificOption(value: CommonOptionValue, from: string) {
    switch (value) {
      case CommonOptionValue.Current: {
        await this.switchToCurrentCategory(from);
        break;
      }

      case CommonOptionValue.Featured: {
        await this.switchToFeatured(from);
        break;
      }

      case CommonOptionValue.Recommended: {
        await this.switchToRecommended();
        break;
      }

      case CommonOptionValue.Followed: {
        await this.switchToFollowed();
        break;
      }

      default:
        throw new Error('Unknown next specific target value');
    }
  }

  private static async switchToCurrentCategory(currentChannelId: string) {
    const { game } = await TwitchAPI.getChannelById(currentChannelId);
    if (!game) throw new NoContentError();
    await this.switchToCategory(game, currentChannelId);
  }

  private static async switchToCategory(category: string, currentChannelId: string) {
    const streams = await TwitchAPI.getStreamsByCategory(category);
    const filtered = streams.filter((x) => x.channel._id.toString() !== currentChannelId);
    if (!filtered.length) throw new NoContentError();
    this.redirect(filtered[0].channel.name);
  }

  private static async switchToFeatured(currentChannelId: string) {
    const streams = await TwitchAPI.getFeaturedStreams();
    const filtered = streams.filter((x) => x.stream.channel._id.toString() !== currentChannelId);
    if (!filtered.length) throw new NoContentError();
    const random = getRandomElement(filtered);
    this.redirect(random.stream.channel.name);
  }

  private static async switchToRecommended() {
    const currentStream = parseChannelName(window.location.pathname);
    const streams =  TwitchDomApi.getRecommendedChannels().filter(x => x !== currentStream);
    if (!streams.length) {
      throw new NoContentError();
    }
    this.redirect(streams[0]);
  }

  private static async switchToFollowed() {
    const currentStream = parseChannelName(window.location.pathname);
    const streams =  TwitchDomApi.getFollowedChannels().filter(x => x !== currentStream);
    if (!streams.length) {
      throw new NoContentError();
    }
    console.log(streams);
  }

  private static async fallback(from: string) {
    try {
      await this.switchToCurrentCategory(from);
    } catch (err) {
      console.info("Couldn't determine next stream in fallback current category - switching to featured");
      if (err instanceof NoContentError) {
        await this.switchToFeatured(from);
      }
      throw err;
    }
  }

  private static redirect(channel: string) {
    window.location.href = `https://twitch.tv/${channel}`;
  }
}
