import { HttpErrorResponse, HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenDto } from '../models/dtos/token-dto.model';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getAccessToken();
  const deviceId = authService.getOrCreateDeviceId();

  // Clone the request and add headers
  const authHeader = accessToken ? `Bearer ${accessToken}` : '';
  const clonedReq = req.clone({
    headers: new HttpHeaders()
      .set('X-DeviceId', deviceId)
      .set('Authorization', authHeader)
  });

  // Handle the response
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check for a 401 Unauthorized error
      if (error.status === 401 && accessToken) {
        // Attempt to refresh the token
        return authService.refreshTokens().pipe(
          switchMap((response: TokenDto) => {
            // Get the new access token and retry the original request
            const newAccessToken = response.accessToken;
            
            // Clone the original request with the new access token and retry it
            const newReq = req.clone({
              headers: new HttpHeaders()
                .set('Authorization', `Bearer ${newAccessToken}`)
                .set('X-DeviceId', deviceId)
            });
            return next(newReq);
          }),
          catchError(() => {
            // If the refresh token fails, log the user out
            authService.logout();
            return throwError(() => new Error('Session expired. Please log in again.'));
          })
        );
      }
      return throwError(() => error);
    })
  );
};
