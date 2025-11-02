import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appAuth]'
})
export class AuthDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  // Role to check (optional)
  appAuth = input<string[] | string | null>(null);

  // Optional else block
  appAuthElse = input<TemplateRef<any> | null>(null);

  constructor() {
    // Reactively watch for changes
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn();
      const requiredRoles = this.appAuth();
      const userRole = this.authService.getRole();
      const elseTemplate = this.appAuthElse();

      this.viewContainer.clear();

      let isAuthorized = isLoggedIn;
      if (Array.isArray(requiredRoles)) {
        isAuthorized = (userRole != null && requiredRoles.includes(userRole));
      } else if (typeof requiredRoles === 'string' && requiredRoles.length > 0) {
        isAuthorized = (userRole != null && requiredRoles === userRole);
      }

      if (isAuthorized) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else if (elseTemplate) {
        this.viewContainer.createEmbeddedView(elseTemplate!);
      }
    });
  }
}
