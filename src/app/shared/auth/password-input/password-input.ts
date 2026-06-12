import { booleanAttribute, Component, computed, ElementRef, forwardRef, input, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-password-input',
  imports: [ReactiveFormsModule, FontAwesomeModule],

  templateUrl: './password-input.html',
  styleUrl: './password-input.scss',
  host: {
    '[attr.id]': 'null',
    '[attr.class]': 'null',
    '[attr.autofocus]': 'null',
    '[attr.autocomplete]': 'null',
    '[attr.placeholder]': 'null',
  },

  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [

    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInput),
      multi: true
    }
  ]
})
export class PasswordInput implements ControlValueAccessor {
  id = input<string>('password');
  autocomplete = input<string>('current-password');
  autofocus = input(false, { transform: booleanAttribute });
  placeholder = input<string>('');
  class = input<string>('');

  inputElement = viewChild<ElementRef<HTMLInputElement>>('passwordInput');

  passwordToggleTitle = computed(() =>
    this.showPassword()
      ? $localize`Hide password`
      : $localize`Show password`
  );

  faEye = faEye;
  faEyeSlash = faEyeSlash;

  showPassword = signal(false);
  value = '';
  disabled = false;

  onChange: any = () => { };
  onTouched: any = () => { };

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) this.showPassword.set(false);
  }
}
