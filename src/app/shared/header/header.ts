import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-header',
  imports: [FontAwesomeModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  faBars = faBars;

  private authService = inject(AuthService);

  logout(): void {
    this.authService.logout()
  }
}
