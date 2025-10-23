import { Component, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faClose, faUser } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthDirective } from '../../core/directives/auth.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-header',
  imports: [FontAwesomeModule, RouterLink, RouterLinkActive, AuthDirective, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  faBars = faBars;
  faUser = faUser;
  faClose = faClose;

  menuMobileOpen = signal(false);
  
  search = toSignal(this.route.queryParams.pipe(map(data => data['search'])));

  goToSearch(searchValue: string) {
    this.router.navigate(['/search'], {
      queryParams: { search: searchValue.trim() }
    });
  }

}
