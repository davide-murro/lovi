import { inject } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FetchInterceptorFn } from './fetch-client/fetch-interceptor.type';
import { AuthService } from '../services/auth.service';

export const authFetchInterceptor: FetchInterceptorFn = async (url, init, next) => {
  const authService = inject(AuthService);
  const localeId = inject(LOCALE_ID);

  const headers = new Headers(init.headers || {});
  const token = authService.getAccessToken();

  if (token) headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-Locale', localeId);

  let response = await next(url, { ...init, headers });

  if (response.status === 401 && authService.isLoggedIn()) {
    try {
      const newToken = await firstValueFrom(
        authService.refreshTokens()
      );

      headers.set('Authorization', `Bearer ${newToken.accessToken}`);
      response = await next(url, { ...init, headers });
    } catch {
      authService.logout();
    }
  }

  return response;
};