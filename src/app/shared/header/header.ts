import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { AuthDirective } from '../../core/directives/auth.directive';


@Component({
  selector: 'app-header',
  imports: [FontAwesomeModule, RouterLink, AuthDirective],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  faBars = faBars;
  faUser = faUser;

  menuMobileOpen = signal(false);
}
