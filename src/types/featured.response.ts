import { Stream } from './stream.response';

interface Featured {
  image: string;
  priority: number;
  scheduled: boolean;
  sponsored: boolean;
  stream: Stream;
  text: string;
  title: string;
}

export interface FeaturedStreamsResponse {
  featured: Featured[];
}
