import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from '../../../core/services/dialog.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { AudioBookDto } from '../../../core/models/dtos/audio-book-dto.model';
import { AudioBooksService } from '../../../core/services/audio-books.service';
import { CreatorDto } from '../../../core/models/dtos/creator-dto.model';
import { CreatorSelectorDialog } from '../../../shared/creator-selector-dialog/creator-selector-dialog';

@Component({
  selector: 'app-edit-audio-book',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './edit-audio-book.html',
  styleUrl: './edit-audio-book.scss'
})
export class EditAudioBook {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private audioBooksService = inject(AudioBooksService);

  faTrash = faTrash;

  audioBook = signal<AudioBookDto | null>(this.route.snapshot.data['audioBook']);

  form = new FormGroup({
    id: new FormControl({ value: this.audioBook()?.id, disabled: true }),
    name: new FormControl(this.audioBook()?.name ?? null!, { nonNullable: true, validators: [Validators.required] }),
    coverImageUrl: new FormControl(this.audioBook()?.coverImageUrl),
    coverImage: new FormControl<File | null>(null),
    description: new FormControl(this.audioBook()?.description),
    audioUrl: new FormControl(this.audioBook()?.audioUrl),
    audio: new FormControl<File | null>(null),
  });
  coverPreview = signal(this.audioBook()?.coverImageUrl ?? null);
  audioPreview = signal(this.audioBook()?.audioUrl ?? null);
  
  load() {
    this.audioBooksService.getById(
      this.audioBook()!.id!
    ).subscribe(
      {
        next: (audioBook) => {
          this.audioBook.set(audioBook);
        },
        error: (err) => {
          console.error('audioBooksService.getById', this.audioBook()!.id!, err);
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
    onSubmit() {
      if (this.form.invalid) return;
  
      const form = this.form.getRawValue();
      const ab: AudioBookDto = {
        id: form.id!,
        name: form.name!,
        coverImageUrl: form.coverImageUrl!,
        coverImage: form.coverImage!,
        description: form.description!,
        audioUrl: form.audioUrl!,
        audio: form.audio!,
      };
  
      if (this.audioBook()?.id != null) {
        this.audioBooksService.update(this.audioBook()!.id!, ab).subscribe({
          next: () => {
            this.toasterService.show('Audio Book updated');
            this.load();
          },
          error: (err) => {
            console.error('audioBooksService.update', this.audioBook()!.id!, ab, err);
            this.toasterService.show('Audio Book update failed', { type: 'error' });
          }
        });
      } else {
        this.audioBooksService.create(ab).subscribe({
          next: (res) => {
            this.toasterService.show('Audio Book created');
            this.router.navigate(['/edit', 'audio-books', res.id])
          },
          error: (err) => {
            console.error('audioBooksService.create', ab, err);
            this.toasterService.show('Audio Book create failed', { type: 'error' });
          }
        });
  
      }
    }
  
    // Readers
    addReader() {
      this.dialogService.open(CreatorSelectorDialog)
        .subscribe((creator: CreatorDto) => {
          if (creator) {
            this.audioBooksService.addReader(this.audioBook()!.id!, creator.id).subscribe({
              next: () => {
                this.load();
              },
              error: (err) => {
                console.error('audioBooksService.addReader', this.audioBook()!.id!, creator.id, err);
                this.toasterService.show('Add Reader failed', { type: 'error' });
              }
            });
          }
        });
    }
    removeReader(readerId: number) {
      this.dialogService.confirm('Remove Audio Book Reader', 'Are you sure vecm?')
        .subscribe(confirmed => {
          if (confirmed) {
            this.audioBooksService.removeReader(this.audioBook()!.id!, readerId).subscribe({
              next: () => {
                this.load();
              },
              error: (err) => {
                console.error('audioBooksService.removeReader', this.audioBook()!.id!, readerId, err);
                this.toasterService.show('Remove Reader failed', { type: 'error' });
              }
            });
          }
        });
    }
}
