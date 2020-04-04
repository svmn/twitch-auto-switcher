import { ChannelResponse } from './channel.response';

interface Preview {
  small: string;
  medium: string;
  large: string;
  template: string;
}

export interface Stream {
  _id: number;
  game: string;
  viewers: number;
  video_height: number;
  average_fps: number;
  delay: number;
  created_at: Date;
  is_playlist: boolean;
  preview: Preview;
  channel: ChannelResponse;
}

export interface StreamByUserResponse {
  stream: Stream | null;
}

export interface LiveStreamsResponse {
  streams: Stream[];
}
