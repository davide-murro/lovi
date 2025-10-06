import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get user info
  const isLoggedIn = authService.isLoggedIn();
  const userRole = authService.getRole();

  // Get required roles from route data
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  // If not logged in -> redirect to login
  if (!isLoggedIn) {
    return router.parseUrl('/login');
  }

  // If route requires a specific role
  if (requiredRoles && requiredRoles.length > 0) {
    if (!userRole || !requiredRoles.includes(userRole)) {
      // Optionally redirect to "forbidden" page
      return router.parseUrl('/forbidden');
    }
  }

  return true;
};
