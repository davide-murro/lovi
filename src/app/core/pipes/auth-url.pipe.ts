import { inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
@Pipe({
  name: 'authUrl',
})
export class AuthUrlPipe implements PipeTransform {
  private authService = inject(AuthService);

  transform(url: string | null | undefined): string | null | undefined {
    if (!url) return url;

    const token = this.authService.getAccessToken();
    if (token) {
      return url.includes('?') ? `${url}&access_token=${token}` : `${url}?access_token=${token}`;
    }
    return url;
  }
}
