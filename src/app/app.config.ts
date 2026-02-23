import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { catchError, of } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideServiceWorker } from '@angular/service-worker';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      // Try to restore session on page load if we have a session hint
      console.log(authService.isLoggedIn())
      if (authService.isLoggedIn()) {
        return authService.refreshTokens().pipe(
          catchError((err) => {
            console.error('Session restoration failed', err);
            return of(null);
          })
        );
      }
      return of(null);
    }),
    provideRouter(routes,
      withInMemoryScrolling({
        // set enabled here but handle better the backnavigation scroll in app.ts
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])), provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};