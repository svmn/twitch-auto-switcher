import { Monitor } from '@/libs/monitor';
import { Switcher } from '@/libs/switcher';
import { tap } from 'rxjs/operators';

(function () {
  let currentChannel: string | undefined | null;

  Monitor.watchUrl()
    .pipe(
      Monitor.mapChannel(),
      tap((x) => (currentChannel = x)),
      Monitor.watchStream(),
    )
    .subscribe({
      complete: () => console.error('Observable completed'),
      error: (err) => console.error('Observable error', err),
      next: (from) => Switcher.switch(from),
    });

  window.addEventListener('keyup', (event) => {
    if (event.key === 'F9' && event.ctrlKey) {
      Switcher.switch(currentChannel!);
    }
  });
})();
