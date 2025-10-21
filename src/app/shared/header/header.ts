import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faClose, faUser } from '@fortawesome/free-solid-svg-icons';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthDirective } from '../../core/directives/auth.directive';


@Component({
  selector: 'app-header',
  imports: [FontAwesomeModule, RouterLink, RouterLinkActive, AuthDirective],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  faBars = faBars;
  faUser = faUser;
  faClose = faClose;

  menuMobileOpen = signal(false);
}
