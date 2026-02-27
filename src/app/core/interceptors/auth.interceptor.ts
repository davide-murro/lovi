import { HttpErrorResponse, HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject, LOCALE_ID } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, filter, take, Observable, shareReplay, finalize, map } from 'rxjs';
import { Router } from '@angular/router';

// Shared refresh observable for all requests
let refreshToken$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const locale = inject(LOCALE_ID);
  const accessToken = authService.getAccessToken();
  const deviceId = authService.getOrCreateDeviceId();

  // Clone the request and add headers
  const authHeader = accessToken
    ? new HttpHeaders()
      .set('X-DeviceId', deviceId)
      .set('X-Locale', locale)
      .set('Authorization', `Bearer ${accessToken}`)
    : new HttpHeaders()
      .set('X-DeviceId', deviceId)
      .set('X-Locale', locale);
  const clonedReq = req.clone({
    headers: authHeader
  });

  // Handle the response
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // check if the refresh call fails
      if (error.url?.includes('/auth/refresh')) {
        refreshToken$ = null;
        authService.logout();
        router.navigate(['/auth', 'login']);
        return throwError(() => new Error('Session expired. Please log in again.'));
      }

      // Check for a 401 Unauthorized error
      if (error.status === 401 && accessToken) {
        if (!refreshToken$) {
          refreshToken$ = authService.refreshTokens().pipe(
            map(response => response.accessToken),
            shareReplay(1),
            finalize(() => {
              refreshToken$ = null;
            })
          );
        }

        return refreshToken$.pipe(
          take(1),
          switchMap(newAccessToken => {
            const newReq = req.clone({
              headers: new HttpHeaders()
                .set('Authorization', `Bearer ${newAccessToken}`)
                .set('X-DeviceId', deviceId)
                .set('X-Locale', locale)
            });
            return next(newReq);
          })
        );
      }

      // else error
      return throwError(() => error);
    })
  );
};
