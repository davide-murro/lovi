import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const errors: ValidationErrors = {};

  if (value.length < 6) errors['minLength'] = true; // at least 6 characters.
  if (!/[A-Z]/.test(value)) errors['uppercase'] = true; // at least one uppercase ('A'-'Z').
  if (!/[a-z]/.test(value)) errors['lowercase'] = true; // at least one lowercase ('A'-'Z').
  if (!/[0-9]/.test(value)) errors['number'] = true;    // at least one digit ('0'-'9').
  if (!/[^A-Za-z0-9]/.test(value)) errors['specialChar'] = true;    // at least one non alphanumeric character.

  return Object.keys(errors).length ? errors : null;
};
