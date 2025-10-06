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
  appAuth = input<string | null>(null);

  // Optional else block
  appAuthElse = input<TemplateRef<any> | null>(null);

  constructor() {
    // Reactively watch for changes
    effect(() => {
      const isLoggedIn = this.authService.isLoggedIn();
      const requiredRole = this.appAuth();
      const userRole = this.authService.getRole();
      const elseTemplate = this.appAuthElse();

      this.viewContainer.clear();

      const isAuthorized = isLoggedIn && (!requiredRole || (userRole && userRole === requiredRole));
      if (isAuthorized) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else if (elseTemplate) {
        this.viewContainer.createEmbeddedView(elseTemplate!);
      }
    });
  }
}
