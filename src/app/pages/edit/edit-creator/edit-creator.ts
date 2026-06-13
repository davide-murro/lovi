import { Component, effect, inject, input, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { faAdd, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { CreatorDto } from '../../../core/models/dtos/creator-dto.model';
import { CreatorsService } from '../../../core/services/creators.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-edit-creator',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './edit-creator.html',
  styleUrl: './edit-creator.scss'
})
export class EditCreator {
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private creatorsService = inject(CreatorsService);

  faAdd = faAdd;
  faPen = faPen;
  faTrash = faTrash;

  creator = input<CreatorDto>();
  creatorEdit = signal<CreatorDto | undefined>(this.creator());

  isLoading = signal(false);
  form = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    nickname: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    name: new FormControl(''),
    surname: new FormControl(''),
    //coverImageUrl: new FormControl(this.creator()?.coverImageUrl),
    //coverImage: new FormControl<File | null>(null)
  });
  //coverPreview = signal(this.creator()?.coverImageUrl ?? null);

  constructor() {
    effect(() => {
      this.form.patchValue({
        id: this.creator()?.id,
        nickname: this.creator()?.nickname,
        name: this.creator()?.name,
        surname: this.creator()?.surname,
        //coverImageUrl: this._creator()?.coverImageUrl,
        //coverImage: null
      });
      //this.coverPreview.set(this._creator()?.coverImageUrl ?? null);
      this.creatorEdit.set(this.creator());
    });
  }


  load() {
    this.creatorsService.getById(
      this.creatorEdit()!.id!
    ).subscribe(
      {
        next: (creator) => {
          this.creatorEdit.set(creator);
        },
        error: (err) => {
          console.error('creatorsService.getById', this.creatorEdit()!.id!, err);
          this.toasterService.show('Get Creator failed', { type: 'error' });
        }
      });
  }

  // Form
  /*onCoverImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.form.controls.coverImage.setValue(file);
    this.form.controls.coverImageUrl.setValue(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.coverPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.coverPreview.set(null);
    }
  }*/
  onSubmit() {
    if (!this.form.valid) return;

    const form = this.form.getRawValue();
    const p: CreatorDto = {
      id: form.id!,
      nickname: form.nickname,
      name: form.name!,
      surname: form.surname!
      //coverImageUrl: form.coverImageUrl!,
      //coverImage: form.coverImage!,
    }
    this.isLoading.set(true);
    if (this.creatorEdit()?.id != null) {
      this.creatorsService.update(this.creatorEdit()!.id!, p).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toasterService.show('Creator updated');
          this.load();
        },
        error: (err) => {
          console.error('creatorsService.update', this.creatorEdit()!.id!, p, err);
          this.isLoading.set(false);
          this.toasterService.show('Creator update failed', { type: 'error' });
        }
      });
    } else {
      this.creatorsService.create(p).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toasterService.show('Creator created');
          this.router.navigate(['/edit', 'creators', res.id])
        },
        error: (err) => {
          console.error('creatorsService.update', p, err);
          this.isLoading.set(false);
          this.toasterService.show('Creator create failed', { type: 'error' });
        }
      });

    }
  }

  delete() {
    this.dialogService.confirm('Delete Creator', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          const id = this.creatorEdit()!.id!;
          this.creatorsService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Creator deleted');
              this.router.navigate(['/edit']);
            },
            error: (err) => {
              console.error('creatorsService.delete', id, err);
              this.toasterService.show('Creator delete failed', { type: 'error' });
            }
          });
        }
      });
  }
}
