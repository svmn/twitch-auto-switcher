import { GetUsersResponse } from '@/types/user.response';
import { StreamByUserResponse, LiveStreamsResponse } from '@/types/stream.response';
import { ChannelResponse } from '@/types/channel.response';
import { FeaturedStreamsResponse } from '@/types/featured.response';
import { TopGamesResponse, SearchGamesResponse } from '@/types/categories.response';

export class TwitchAPI {
  private static endpoint = 'https://api.twitch.tv/kraken';
  private static clientId = 'sf954451u6y5bcsilwklkw4tsd8za3';

  private static async request<T>(path: string): Promise<T> {
    const response = await fetch(this.endpoint + path, {
      headers: {
        'Client-ID': this.clientId,
        accept: 'application/vnd.twitchtv.v5+json',
      },
    });
    if (response.status !== 200) {
      throw new Error('Bad response from server');
    }

    return response.json();
  }

  public static async getChannelId(name: string): Promise<string | null> {
    const response = await this.request<GetUsersResponse>(`/users/?login=${name}`);
    return response._total === 0 ? null : response.users[0]._id;
  }

  public static async isOffline(id: string): Promise<boolean> {
    const response = await this.getStreamById(id);
    return !response.stream;
  }

  public static async getChannelById(id: string) {
    return this.request<ChannelResponse>(`/channels/${id}`);
  }

  public static async getStreamById(id: string): Promise<StreamByUserResponse> {
    return this.request<StreamByUserResponse>(`/streams/${id}`);
  }

  public static async getStreamsByCategory(category: string) {
    const response = await this.request<LiveStreamsResponse>(`/streams/?game=${encodeURIComponent(category)}`);
    return response.streams;
  }

  public static async getFeaturedStreams() {
    const response = await this.request<FeaturedStreamsResponse>('/streams/featured');
    return response.featured;
  }

  public static async getTopCategories() {
    const response = await this.request<TopGamesResponse>('/games/top?limit=30');
    return response.top.map((x) => x.game);
  }

  public static async searchCategories(query: string) {
    const response = await this.request<SearchGamesResponse>(`/search/games?type=suggest&live=true&query=${query}`);
    return response.games || [];
  }
}
