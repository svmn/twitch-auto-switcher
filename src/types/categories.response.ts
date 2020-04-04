export interface Box {
  large: string;
  medium: string;
  small: string;
  template: string;
}

export interface Logo {
  large: string;
  medium: string;
  small: string;
  template: string;
}

export interface Game {
  _id: number;
  box: Box;
  giantbomb_id: number;
  logo: Logo;
  name: string;
  popularity: number;
}

interface Top {
  channels: number;
  viewers: number;
  game: Game;
}

export interface TopGamesResponse {
  _total: number;
  top: Top[];
}

export interface SearchGamesResponse {
  games: Game[] | null;
}
