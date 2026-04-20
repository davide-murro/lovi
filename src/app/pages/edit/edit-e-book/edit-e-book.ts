import { Component, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRefresh, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { EBookDto } from '../../../core/models/dtos/e-book-dto.model';
import { EBooksService } from '../../../core/services/e-books.service';
import { CreatorDto } from '../../../core/models/dtos/creator-dto.model';
import { CreatorSelectorDialog } from '../../../shared/creator-selector-dialog/creator-selector-dialog';
import { SecureMediaDirective } from '../../../core/directives/secure-media.directive';
import { EpubReaderComponent } from '../../../shared/epub-reader/epub-reader.component';

@Component({
  selector: 'app-edit-e-book',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink, SecureMediaDirective, EpubReaderComponent],
  templateUrl: './edit-e-book.html',
  styleUrl: './edit-e-book.scss'
})
export class EditEBook {
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private eBooksService = inject(EBooksService);

  faTrash = faTrash;
  faRefresh = faRefresh;

  eBook = input<EBookDto>();
  eBookEdit = signal<EBookDto | undefined>(this.eBook());

  isLoading = signal(false);
  form = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    coverImageUrl: new FormControl(''),
    coverImageValue: new FormControl<string | null>(null),
    coverImage: new FormControl<File | null>(null),
    coverImagePreviewUrl: new FormControl(''),
    coverImagePreviewValue: new FormControl<string | null>(null),
    coverImagePreview: new FormControl<File | null>(null),
    description: new FormControl(''),
    fileUrl: new FormControl(''),
    fileValue: new FormControl<string | null>(null),
    file: new FormControl<File | null>(null),
  });
  coverPreview = signal<string | null>(null);
  coverPreviewPreview = signal<string | null>(null);
  filePreview = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.form.patchValue({
        id: this.eBook()?.id,
        name: this.eBook()?.name,
        coverImageUrl: this.eBook()?.coverImageUrl,
        coverImageValue: null,
        coverImage: null,
        coverImagePreviewUrl: this.eBook()?.coverImagePreviewUrl,
        coverImagePreviewValue: null,
        coverImagePreview: null,
        description: this.eBook()?.description,
        fileUrl: this.eBook()?.fileUrl,
        fileValue: null,
        file: null,
      });
      this.coverPreview.set(this.eBook()?.coverImageUrl ?? null);
      this.coverPreviewPreview.set(this.eBook()?.coverImagePreviewUrl ?? null);
      this.filePreview.set(this.eBook()?.fileUrl ?? null);
      this.eBookEdit.set(this.eBook());
    });
  }

  load() {
    this.eBooksService.getById(
      this.eBookEdit()!.id!
    ).subscribe(
      {
        next: (eBook) => {
          this.eBookEdit.set(eBook);
        },
        error: (err) => {
          console.error('eBooksService.getById', this.eBookEdit()!.id!, err);
          this.toasterService.show('Get eBook failed', { type: 'error' });
        }
      });
  }

  // eBook form
  onCoverImageSelected(event: Event) {
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
  }
  onCoverImagePreviewSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.form.controls.coverImagePreview.setValue(file);
    this.form.controls.coverImagePreviewUrl.setValue(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.coverPreviewPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.coverPreviewPreview.set(null);
    }
  }
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.form.controls.file.setValue(file);
    this.form.controls.fileUrl.setValue(null);

    if (file) {
      // create blob URL to preview the epub file
      const reader = new FileReader();
      reader.onload = () => this.filePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      this.filePreview.set(null);
    }
  }

  onSubmit() {
    if (!this.form.valid) return;

    const form = this.form.getRawValue();
    const ab: EBookDto = {
      id: form.id!,
      name: form.name!,
      coverImageUrl: form.coverImageUrl!,
      coverImage: form.coverImage!,
      coverImagePreviewUrl: form.coverImagePreviewUrl!,
      coverImagePreview: form.coverImagePreview!,
      description: form.description!,
      fileUrl: form.fileUrl!,
      file: form.file!,
    };

    this.isLoading.set(true);
    if (this.eBookEdit()?.id != null) {
      this.eBooksService.update(this.eBookEdit()!.id!, ab).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toasterService.show('eBook updated');
          this.load();
        },
        error: (err) => {
          console.error('eBooksService.update', this.eBookEdit()!.id!, ab, err);
          this.isLoading.set(false);
          this.toasterService.show('eBook update failed', { type: 'error' });
        }
      });
    } else {
      this.eBooksService.create(ab).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toasterService.show('eBook created');
          this.router.navigate(['/edit', 'e-books', res.id])
        },
        error: (err) => {
          console.error('eBooksService.create', ab, err);
          this.isLoading.set(false);
          this.toasterService.show('eBook create failed', { type: 'error' });
        }
      });

    }
  }

  delete() {
    this.dialogService.confirm('Delete eBook', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          const id = this.eBookEdit()!.id!;
          this.eBooksService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('eBook deleted');
              this.router.navigate(['/edit']);
            },
            error: (err) => {
              console.error('eBooksService.delete', id, err);
              this.toasterService.show('eBook delete failed', { type: 'error' });
            }
          });
        }
      });
  }

  // Writers
  addWriter() {
    this.dialogService.open(CreatorSelectorDialog)
      .subscribe((creator: CreatorDto) => {
        if (creator) {
          this.eBooksService.addWriter(this.eBookEdit()!.id!, creator.id!).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('eBooksService.addWriter', this.eBookEdit()!.id!, creator.id, err);
              this.toasterService.show('Add Writer failed', { type: 'error' });
            }
          });
        }
      });
  }
  removeWriter(writerId: number) {
    this.dialogService.confirm('Remove eBook Writer', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.eBooksService.removeWriter(this.eBookEdit()!.id!, writerId).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('eBooksService.removeWriter', this.eBookEdit()!.id!, writerId, err);
              this.toasterService.show('Remove Writer failed', { type: 'error' });
            }
          });
        }
      });
  }
}
