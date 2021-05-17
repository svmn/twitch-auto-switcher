export class TwitchDomApi {
  static getRecommendedChannels(): string[] {
    return this.getChannelsList('a[data-a-target="recommended-channel"]')

  }

  static getFollowedChannels(): string[] {
    return this.getChannelsList('a[data-a-target="followed-channel"]')
  }

  private static getChannelsList(selector: string) {
    const elements = document.querySelectorAll<HTMLAnchorElement>(selector);
    return Array.from(elements).map((el) => el.href.split('/').pop()!);
  }
}
