import { Component, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRefresh, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { BookDto } from '../../../core/models/dtos/book-dto.model';
import { BooksService } from '../../../core/services/books.service';
import { CreatorDto } from '../../../core/models/dtos/creator-dto.model';
import { CreatorSelectorDialog } from '../../../shared/creator-selector-dialog/creator-selector-dialog';
import { SecureMediaDirective } from '../../../core/directives/secure-media.directive';
import { EpubReaderComponent } from '../../../shared/epub-reader/epub-reader.component';

@Component({
  selector: 'app-edit-book',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink, SecureMediaDirective, EpubReaderComponent],
  templateUrl: './edit-book.html',
  styleUrl: './edit-book.scss'
})
export class EditBook {
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private booksService = inject(BooksService);

  faTrash = faTrash;
  faRefresh = faRefresh;

  book = input<BookDto>();
  bookEdit = signal<BookDto | undefined>(this.book());

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
    audioUrl: new FormControl(''),
    audioValue: new FormControl<string | null>(null),
    audio: new FormControl<File | null>(null),
    fileUrl: new FormControl(''),
    fileValue: new FormControl<string | null>(null),
    file: new FormControl<File | null>(null),
  });
  coverPreview = signal<string | null>(null);
  coverPreviewPreview = signal<string | null>(null);
  audioPreview = signal<string | null>(null);
  filePreview = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.form.patchValue({
        id: this.book()?.id,
        name: this.book()?.name,
        coverImageUrl: this.book()?.coverImageUrl,
        coverImageValue: null,
        coverImage: null,
        coverImagePreviewUrl: this.book()?.coverImagePreviewUrl,
        coverImagePreviewValue: null,
        coverImagePreview: null,
        description: this.book()?.description,
        audioUrl: this.book()?.audioUrl,
        audioValue: null,
        audio: null,
        fileUrl: this.book()?.fileUrl,
        fileValue: null,
        file: null,
      });
      this.coverPreview.set(this.book()?.coverImageUrl ?? null);
      this.coverPreviewPreview.set(this.book()?.coverImagePreviewUrl ?? null);
      this.audioPreview.set(this.book()?.audioUrl ?? null);
      this.filePreview.set(this.book()?.fileUrl ?? null);
      this.bookEdit.set(this.book());
    });
  }

  load() {
    this.booksService.getById(
      this.bookEdit()!.id!
    ).subscribe(
      {
        next: (book) => {
          this.bookEdit.set(book);
        },
        error: (err) => {
          console.error('booksService.getById', this.bookEdit()!.id!, err);
          this.toasterService.show('Get Book failed', { type: 'error' });
        }
      });
  }

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
  onAudioSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.form.controls.audio.setValue(file);
    this.form.controls.audioUrl.setValue(null);

    if (file) {
      const url = URL.createObjectURL(file);
      this.audioPreview.set(url);
    } else {
      this.audioPreview.set(null);
    }
  }
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.form.controls.file.setValue(file);
    this.form.controls.fileUrl.setValue(null);

    if (file) {
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
    const b: BookDto = {
      id: form.id!,
      name: form.name!,
      coverImageUrl: form.coverImageUrl!,
      coverImage: form.coverImage!,
      coverImagePreviewUrl: form.coverImagePreviewUrl!,
      coverImagePreview: form.coverImagePreview!,
      description: form.description!,
      audioUrl: form.audioUrl!,
      audio: form.audio!,
      fileUrl: form.fileUrl!,
      file: form.file!,
    };

    this.isLoading.set(true);
    if (this.bookEdit()?.id != null) {
      this.booksService.update(this.bookEdit()!.id!, b).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toasterService.show('Book updated');
          this.load();
        },
        error: (err) => {
          console.error('booksService.update', this.bookEdit()!.id!, b, err);
          this.isLoading.set(false);
          this.toasterService.show('Book update failed', { type: 'error' });
        }
      });
    } else {
      this.booksService.create(b).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toasterService.show('Book created');
          this.router.navigate(['/edit', 'books', res.id])
        },
        error: (err) => {
          console.error('booksService.create', b, err);
          this.isLoading.set(false);
          this.toasterService.show('Book create failed', { type: 'error' });
        }
      });
    }
  }

  delete() {
    this.dialogService.confirm('Delete Book', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          const id = this.bookEdit()!.id!;
          this.booksService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Book deleted');
              this.router.navigate(['/edit']);
            },
            error: (err) => {
              console.error('booksService.delete', id, err);
              this.toasterService.show('Book delete failed', { type: 'error' });
            }
          });
        }
      });
  }

  // Readers/Writers
  addReader() {
    this.dialogService.open(CreatorSelectorDialog)
      .subscribe((creator: CreatorDto) => {
        if (creator) {
          this.booksService.addReader(this.bookEdit()!.id!, creator.id!).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('booksService.addReader', this.bookEdit()!.id!, creator.id, err);
              this.toasterService.show('Add Reader failed', { type: 'error' });
            }
          });
        }
      });
  }
  removeReader(readerId: number) {
    this.dialogService.confirm('Remove Book Reader', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.booksService.removeReader(this.bookEdit()!.id!, readerId).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('booksService.removeReader', this.bookEdit()!.id!, readerId, err);
              this.toasterService.show('Remove Reader failed', { type: 'error' });
            }
          });
        }
      });
  }
  addWriter() {
    this.dialogService.open(CreatorSelectorDialog)
      .subscribe((creator: CreatorDto) => {
        if (creator) {
          this.booksService.addWriter(this.bookEdit()!.id!, creator.id!).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('booksService.addWriter', this.bookEdit()!.id!, creator.id, err);
              this.toasterService.show('Add Writer failed', { type: 'error' });
            }
          });
        }
      });
  }
  removeWriter(writerId: number) {
    this.dialogService.confirm('Remove Book Writer', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.booksService.removeWriter(this.bookEdit()!.id!, writerId).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('booksService.removeWriter', this.bookEdit()!.id!, writerId, err);
              this.toasterService.show('Remove Writer failed', { type: 'error' });
            }
          });
        }
      });
  }
}
