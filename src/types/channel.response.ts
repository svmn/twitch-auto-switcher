export interface ChannelResponse {
  mature: boolean;
  status: string | null;
  broadcaster_language: string | null;
  display_name: string;
  game: string | null;
  language: string;
  _id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  partner: boolean;
  logo: string;
  video_banner: string;
  profile_banner: string;
  profile_banner_background_color?: string;
  url: string;
  views: number;
  followers: number;
}
