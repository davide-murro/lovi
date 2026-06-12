import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { DialogService } from '../../core/services/dialog.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-locale-selector-dialog',
  imports: [],
  templateUrl: './locale-selector-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './locale-selector-dialog.scss'
})
export class LocaleSelectorDialog {
  private dialogService = inject(DialogService);

  readonly locales = environment.locales;
  readonly localeSelected = input.required<string>();

  selectLocale(locale: { code: string; label: string }) {
    this.dialogService.close(locale);
  }
}
