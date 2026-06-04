import { Component, computed, effect, inject, LOCALE_ID, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faClose, faMagnifyingGlass, faUser, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthDirective } from '../../core/directives/auth.directive';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DialogService } from '../../core/services/dialog.service';
import { environment } from '../../../environments/environment';
import { LocaleSelectorDialog } from '../locale-selector-dialog/locale-selector-dialog';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
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
  private locales = environment.locales;
  private currentLocale = inject(LOCALE_ID);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialogService = inject(DialogService);

  menuMobileTitle = computed(() =>
    this.menuMobileOpen()
      ? $localize`Close menu`
      : $localize`Open menu`
  );

  faBars = faBars;
  faUser = faUser;
  faClose = faClose;
  faMagnifyingGlass = faMagnifyingGlass;
  faGlobe = faGlobe;

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

  toggleMenuMobile() {
    this.menuMobileOpen.set(!this.menuMobileOpen());
  }

  onSearchSubmit() {
    if (!this.searchForm.valid) return;

    const searchValue = this.searchForm.value.search?.trim();
    this.router.navigate(['/search'], {
      queryParams: { search: searchValue },
    });
  }

  selectLanguage() {
    this.dialogService.open(LocaleSelectorDialog, { data: { localeSelected: this.currentLocale } })
      .subscribe((locale: { code: string; label: string }) => {
        if (!locale) return;

        const localeCodes = this.locales.map(l => l.code);
        const location = window.location.href;
        const segments = location.split('/');

        if (!localeCodes.includes(locale.code)) return;

        const localeIndex = segments.findIndex(s => localeCodes.includes(s));
        if (localeIndex === -1) return;

        segments[localeIndex] = locale.code;
        const newHref = `${segments.join('/')}`;
        window.location.href = newHref;
      });
  }
}
