import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, LOCALE_ID, untracked } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, take, map } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return untracked(() => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const locale = inject(LOCALE_ID);
    const isLoggedIn = authService.isLoggedIn();
    const accessToken = authService.getAccessToken();
    const deviceId = authService.getOrCreateDeviceId();
    const currentUrl = router.currentNavigation()?.extractedUrl.toString() ?? router.url;

    // Clone the request and add headers
    const setHeaders: any = {
      'X-DeviceId': deviceId,
      'X-Locale': locale
    };
    if (accessToken) {
      setHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    const clonedReq = req.clone({
      setHeaders
    });

    // Handle the response
    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // check if the refresh call fails
        if (error.url?.includes('/auth/refresh')) {
          // If it's a network error (0) or a server error (5xx), dont logout.
          // We want to stay "logged in" offline.
          if (error.status === 0 || error.status >= 500) {
            return throwError(() => new Error('Server unreachable. Application is not connected.'));
          }

          authService.logout();
          router.navigate(['/auth', 'login'], { queryParams: { redirect: currentUrl } });
          return throwError(() => new Error('Session expired. Please log in again.'));
        }

        // Check for a 401 Unauthorized error
        if (error.status === 401 && isLoggedIn) {
          return authService.refreshTokens().pipe(
            map(response => response.accessToken),
            take(1),
            switchMap(newAccessToken => {
              const newReq = req.clone({
                setHeaders: {
                  'Authorization': `Bearer ${newAccessToken}`,
                  'X-DeviceId': deviceId,
                  'X-Locale': locale
                }
              });
              return next(newReq);
            })
          );
        }

        // else error
        return throwError(() => error);
      })
    );
  });
};
