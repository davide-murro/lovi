import { Component, effect, inject, input, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { faAdd, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RolesService } from '../../../core/services/roles.service';
import { RoleDto } from '../../../core/models/dtos/auth/role-dto.model';

@Component({
  selector: 'app-edit-role',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './edit-role.html',
  styleUrl: './edit-role.scss'
})
export class EditRole {
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private rolesService = inject(RolesService);

  faAdd = faAdd;
  faPen = faPen;
  faTrash = faTrash;

  role = input<RoleDto>();
  roleEdit = signal<RoleDto | undefined>(this.role());

  isLoading = signal(false);
  form = new FormGroup({
    id: new FormControl(this.roleEdit()?.id, Validators.required),
    name: new FormControl(this.roleEdit()?.name, Validators.required),
  });

  constructor() {
    effect(() => {
      this.form.patchValue({
        id: this.role()?.id,
        name: this.role()?.name
      });
      this.roleEdit.set(this.role());
    });
  }


  load() {
    this.rolesService.getById(
      this.roleEdit()!.id!
    ).subscribe(
      {
        next: (role) => {
          this.roleEdit.set(role);
        },
        error: (err) => {
          console.error('rolesService.getById', this.roleEdit()!.id!, err);
          this.toasterService.show('Get Role failed', { type: 'error' });
        }
      });
  }

  // Form
  onSubmit() {
    if (!this.form.valid) return;

    const form = this.form.getRawValue();
    const p: RoleDto = {
      id: form.id!,
      name: form.name!
    }
    this.isLoading.set(true);
    if (this.roleEdit()?.id != null) {
      this.rolesService.update(this.roleEdit()!.id!, p).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toasterService.show('Role updated');
          this.load();
        },
        error: (err) => {
          console.error('rolesService.update', this.roleEdit()!.id!, p, err);
          this.isLoading.set(false);
          this.toasterService.show('Role update failed', { type: 'error' });
        }
      });
    } else {
      this.rolesService.create(p).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toasterService.show('Role created');
          this.router.navigate(['/edit', 'roles', res.id])
        },
        error: (err) => {
          console.error('rolesService.update', p, err);
          this.isLoading.set(false);
          this.toasterService.show('Role create failed', { type: 'error' });
        }
      });

    }
  }

  delete() {
    this.dialogService.confirm('Delete Role', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          const id = this.roleEdit()!.id!;
          this.rolesService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Role deleted');
              this.router.navigate(['/edit']);
            },
            error: (err) => {
              console.error('rolesService.delete', id, err);
              this.toasterService.show('Role delete failed', { type: 'error' });
            }
          });
        }
      });
  }
}
