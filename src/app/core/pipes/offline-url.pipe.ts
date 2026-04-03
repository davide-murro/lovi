import { inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import { OfflineService } from '../services/offline.service';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
@Pipe({
  name: 'offlineUrl'
})
export class OfflineUrlPipe implements PipeTransform {
  private authService = inject(AuthService);
  private offlineService = inject(OfflineService);

  transform(url: string | null | undefined): string | null | undefined {
    if (!url) return url;

    if (!this.authService.isLoggedIn()) {
      return url;
    }

    if (!url.includes('&isOffline=') && !url.includes('?isOffline=') && this.offlineService.isUrlDownloaded(url)) {
      return url.includes('?') ? `${url}&isOffline=True` : `${url}?isOffline=True`;
    }
    return url;
  }
}
