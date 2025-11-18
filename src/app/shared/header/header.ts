import { Component, effect, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faClose, faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthDirective } from '../../core/directives/auth.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [
    ReactiveFormsModule,
    FontAwesomeModule,
    RouterLink,
    RouterLinkActive,
    AuthDirective,
    FormsModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  faBars = faBars;
  faUser = faUser;
  faClose = faClose;
  faMagnifyingGlass = faMagnifyingGlass;

  private _search = toSignal(this.route.queryParams.pipe(map((data) => data['search'])));

  searchForm = new FormGroup({
    search: new FormControl<string>('', Validators.required),
  });

  menuMobileOpen = signal(false);

  constructor() {
    effect(() => {
      this.searchForm.patchValue({
        search: this._search(),
      });
    });
  }

  onSearchSubmit() {
    if (!this.searchForm.valid) return;

    const searchValue = this.searchForm.value.search?.trim();
    this.router.navigate(['/search'], {
      queryParams: { search: searchValue },
    });
  }
}
