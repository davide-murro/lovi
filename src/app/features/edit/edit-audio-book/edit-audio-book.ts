import { Component, effect, inject, input, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRefresh, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { AudioBookDto } from '../../../core/models/dtos/audio-book-dto.model';
import { AudioBooksService } from '../../../core/services/audio-books.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreatorDto } from '../../../core/models/dtos/creator-dto.model';
import { CreatorSelectorDialog } from '../../../shared/creator-selector-dialog/creator-selector-dialog';
import { AuthUrlPipe } from "../../../core/pipes/auth-url.pipe";

@Component({
  selector: 'app-edit-audio-book',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink, AuthUrlPipe],
  templateUrl: './edit-audio-book.html',
  styleUrl: './edit-audio-book.scss'
})
export class EditAudioBook {
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private audioBooksService = inject(AudioBooksService);
  private authService = inject(AuthService);

  faTrash = faTrash;
  faRefresh = faRefresh;

  audioBook = input<AudioBookDto>();
  audioBookEdit = signal<AudioBookDto | undefined>(this.audioBook());

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
  });
  coverPreview = signal<string | null>(null);
  coverPreviewPreview = signal<string | null>(null);
  audioPreview = signal<string | null>(null);
  isAudioError = signal(false);

  constructor() {
    effect(() => {
      this.form.patchValue({
        id: this.audioBook()?.id,
        name: this.audioBook()?.name,
        coverImageUrl: this.audioBook()?.coverImageUrl,
        coverImageValue: null,
        coverImage: null,
        coverImagePreviewUrl: this.audioBook()?.coverImagePreviewUrl,
        coverImagePreviewValue: null,
        coverImagePreview: null,
        description: this.audioBook()?.description,
        audioUrl: this.audioBook()?.audioUrl,
        audioValue: null,
        audio: null
      });
      this.coverPreview.set(this.audioBook()?.coverImageUrl ?? null);
      this.coverPreviewPreview.set(this.audioBook()?.coverImagePreviewUrl ?? null);
      this.audioPreview.set(this.audioBook()?.audioUrl ?? null);
      this.audioBookEdit.set(this.audioBook());
    });
  }

  load() {
    this.audioBooksService.getById(
      this.audioBookEdit()!.id!
    ).subscribe(
      {
        next: (audioBook) => {
          this.audioBookEdit.set(audioBook);
        },
        error: (err) => {
          console.error('audioBooksService.getById', this.audioBookEdit()!.id!, err);
          this.toasterService.show('Get Audio Book failed', { type: 'error' });
        }
      });
  }

  // audioBook form
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
      // create blob URL to preview directly in <audio>
      const url = URL.createObjectURL(file);
      this.audioPreview.set(url);
    } else {
      this.audioPreview.set(null);
    }
  }
  async refreshAudio() {
    try {
      await firstValueFrom(this.authService.refreshTokens());
    } catch (e) { }
    const current = this.audioPreview();
    this.audioPreview.set(null);
    setTimeout(() => this.audioPreview.set(current));
  }
  deleteAudio() {
    this.form.controls.audio.setValue(null);
    this.form.controls.audioUrl.setValue(null);
    this.audioPreview.set(null);
  }

  onSubmit() {
    if (!this.form.valid) return;

    const form = this.form.getRawValue();
    const ab: AudioBookDto = {
      id: form.id!,
      name: form.name!,
      coverImageUrl: form.coverImageUrl!,
      coverImage: form.coverImage!,
      coverImagePreviewUrl: form.coverImagePreviewUrl!,
      coverImagePreview: form.coverImagePreview!,
      description: form.description!,
      audioUrl: form.audioUrl!,
      audio: form.audio!,
    };

    this.isLoading.set(true);
    if (this.audioBookEdit()?.id != null) {
      this.audioBooksService.update(this.audioBookEdit()!.id!, ab).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toasterService.show('Audio Book updated');
          this.load();
        },
        error: (err) => {
          console.error('audioBooksService.update', this.audioBookEdit()!.id!, ab, err);
          this.isLoading.set(false);
          this.toasterService.show('Audio Book update failed', { type: 'error' });
        }
      });
    } else {
      this.audioBooksService.create(ab).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toasterService.show('Audio Book created');
          this.router.navigate(['/edit', 'audio-books', res.id])
        },
        error: (err) => {
          console.error('audioBooksService.create', ab, err);
          this.isLoading.set(false);
          this.toasterService.show('Audio Book create failed', { type: 'error' });
        }
      });

    }
  }

  delete() {
    this.dialogService.confirm('Delete Audio Book', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          const id = this.audioBookEdit()!.id!;
          this.audioBooksService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Audio Book deleted');
              this.router.navigate(['/edit']);
            },
            error: (err) => {
              console.error('audioBooksService.delete', id, err);
              this.toasterService.show('Audio Book delete failed', { type: 'error' });
            }
          });
        }
      });
  }

  // Readers
  addReader() {
    this.dialogService.open(CreatorSelectorDialog)
      .subscribe((creator: CreatorDto) => {
        if (creator) {
          this.audioBooksService.addReader(this.audioBookEdit()!.id!, creator.id!).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('audioBooksService.addReader', this.audioBookEdit()!.id!, creator.id, err);
              this.toasterService.show('Add Reader failed', { type: 'error' });
            }
          });
        }
      });
  }
  removeReader(readerId: number) {
    this.dialogService.confirm('Remove Audio Book Reader', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.audioBooksService.removeReader(this.audioBookEdit()!.id!, readerId).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('audioBooksService.removeReader', this.audioBookEdit()!.id!, readerId, err);
              this.toasterService.show('Remove Reader failed', { type: 'error' });
            }
          });
        }
      });
  }
}
