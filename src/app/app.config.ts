import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { offlineInterceptor } from './core/interceptors/offline.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { AuthService } from './core/services/auth.service';
import { authFetchInterceptor } from './core/interceptors/auth.fetch-interceptor';
import { provideFetchClient } from './core/interceptors/fetch-client/provide-fetch-client';
import { offlineFetchInterceptor } from './core/interceptors/offline.fetch-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      // Try to restore session on page load if we have a session hint
      if (authService.isLoggedIn()) {
        return authService.refreshTokens().pipe(
          catchError((err) => {
            console.error('authService.refreshTokens', err);
            return of(null);
          })
        );
      }
      return of(null);
    }),
    provideRouter(routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        // set enabled here but handle better the backnavigation scroll in app.ts
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(withInterceptors([authInterceptor, offlineInterceptor])),
    provideFetchClient(authFetchInterceptor, offlineFetchInterceptor),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};