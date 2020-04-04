import { Observable, pipe, from, interval, empty, of } from 'rxjs';
import { mapTo, map, distinctUntilChanged, filter, switchMap, catchError, scan, take } from 'rxjs/operators';
import { parseChannelName, areArraysEqual } from './utils';
import { TwitchAPI } from './twitch-api';

const OFFLINE_THRESHOLD = 2;
const POLLING_INTERVAL = 5000;

export class Monitor {
  private static observeOnMutation(target: Node, config: MutationObserverInit): Observable<MutationRecord[]> {
    return new Observable((observer) => {
      const mutation = new MutationObserver((mutations) => {
        observer.next(mutations);
      });
      mutation.observe(target, config);

      const unsubscribe = () => {
        mutation.disconnect();
      };
      return unsubscribe;
    });
  }

  public static watchUrl(): Observable<string> {
    return this.observeOnMutation(document.body, { childList: true, subtree: true }).pipe(
      map(() => window.location.pathname),
      distinctUntilChanged(),
    );
  }

  public static mapChannel() {
    return pipe(
      map(parseChannelName),
      switchMap((channel) => (channel ? this.getChannelId$(channel) : of(null))),
    );
  }

  public static watchStream() {
    return pipe(
      switchMap((channelId: string | null) => (channelId ? this.watchStreamWithInterval(channelId) : empty())),
    );
  }

  private static watchStreamWithInterval(channelId: string) {
    const capture = OFFLINE_THRESHOLD + 1;
    const offlinePattern = [false, ...Array(OFFLINE_THRESHOLD).fill(true)];

    return interval(POLLING_INTERVAL).pipe(
      switchMap(() => this.isOffline$(channelId)),
      scan<boolean, boolean[]>((acc, value) => [...acc, value].slice(-capture), []),
      map((pollingResult) => areArraysEqual(pollingResult, offlinePattern)),
      filter(Boolean),
      mapTo(channelId),
      take(1),
    );
  }

  private static getChannelId$(name: string) {
    return from(TwitchAPI.getChannelId(name)).pipe(
      catchError((err) => {
        console.error('Error on getChannelId', err);
        return empty();
      }),
    );
  }

  private static isOffline$(streamId: string) {
    return from(TwitchAPI.isOffline(streamId)).pipe(
      catchError((err) => {
        console.error('Error on isOffline', err);
        return empty();
      }),
    );
  }
}
