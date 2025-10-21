import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates that all specified form controls have the same value.
 * Accepts any number of control names dynamically.
 *
 * Example:
 *   valuesMatchValidator(['password', 'passwordRepeat', 'passwordConfirm'])
 */
export function valuesMatchValidator(fields: string[]): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    if (!group || !fields?.length) return null;

    const controls = fields
      .map(name => group.get(name))
      .filter((c): c is AbstractControl => !!c);

    if (controls.length < 2) return null; // Need at least 2 to compare

    const values = controls.map(c => c.value);
    const allEqual = values.every(v => v === values[0]);

    const errorKey = 'valuesMismatch';

    // Assign or clear errors on all controls
    for (const control of controls) {
      const errors = control.errors || {};
      if (!allEqual) {
        control.setErrors({ ...errors, [errorKey]: true });
      } else if (errors[errorKey]) {
        // remove only our specific error
        delete errors[errorKey];
        control.setErrors(Object.keys(errors).length ? errors : null);
      }
    }

    return allEqual ? null : { [errorKey]: true };
  };
}
