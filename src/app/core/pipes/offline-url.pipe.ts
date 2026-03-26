import { inject, Injectable, Injector, Pipe, PipeTransform } from '@angular/core';
import { OfflineService } from '../services/offline.service';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
@Pipe({
  name: 'offlineUrl'
})
export class OfflineUrlPipe implements PipeTransform {
  private injector = inject(Injector);
  private authService = inject(AuthService);

  transform(url: string | null | undefined): string | null | undefined {
    if (!url) return url;

    if (!this.authService.isLoggedIn()) {
      return url;
    }

    const offlineService = this.injector.get(OfflineService);
    if (offlineService.isUrlDownloaded(url)) {
      return url.includes('?') ? `${url}&isOffline=True` : `${url}?isOffline=True`;
    }
    return url;
  }
}
