import { Component, effect, inject, Signal, signal } from '@angular/core';
import { PodcastDto } from '../../../core/models/dtos/podcast-dto.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAdd, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { PodcastsService } from '../../../core/services/podcasts.service';
import { DialogService } from '../../../core/services/dialog.service';
import { CreatorDto } from '../../../core/models/dtos/creator-dto.model';
import { ToasterService } from '../../../core/services/toaster.service';
import { CreatorSelectorDialog } from '../../../shared/creator-selector-dialog/creator-selector-dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-edit-podcast',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './edit-podcast.html',
  styleUrl: './edit-podcast.scss'
})
export class EditPodcast {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private podcastsService = inject(PodcastsService);

  faAdd = faAdd;
  faPen = faPen;
  faTrash = faTrash;

  private _podcast: Signal<PodcastDto | null> = toSignal(this.route.data.pipe(map(data => data['podcast'])));

  podcast = signal<PodcastDto | null>(this._podcast());

  isLoading = signal(false);
  form = new FormGroup({
    id: new FormControl<number>({ value: null!, disabled: true }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    coverImageUrl: new FormControl(''),
    coverImageValue: new FormControl<string | null>(null),
    coverImage: new FormControl<File | null>(null),
    coverImagePreviewUrl: new FormControl(''),
    coverImagePreviewValue: new FormControl<string | null>(null),
    coverImagePreview: new FormControl<File | null>(null),
    description: new FormControl(''),
  });
  coverPreview = signal<string | null>(null);
  coverPreviewPreview = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.form.patchValue({
        id: this._podcast()?.id,
        name: this._podcast()?.name ?? null!,
        coverImageUrl: this._podcast()?.coverImageUrl,
        coverImageValue: null,
        coverImage: null,
        coverImagePreviewUrl: this._podcast()?.coverImagePreviewUrl,
        coverImagePreviewValue: null,
        coverImagePreview: null,
        description: this._podcast()?.description,
      });
      this.coverPreview.set(this._podcast()?.coverImageUrl ?? null);
      this.coverPreviewPreview.set(this._podcast()?.coverImagePreviewUrl ?? null);
      this.podcast.set(this._podcast());
    });
  }


  load() {
    this.podcastsService.getById(
      this.podcast()!.id!
    ).subscribe(
      {
        next: (podcast) => {
          this.podcast.set(podcast);
        },
        error: (err) => {
          console.error('podcastsService.getById', this.podcast()!.id!, err);
          this.toasterService.show('Get Podcast failed', { type: 'error' });
        }
      });
  }

  // Form
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
  onSubmit() {
    if (this.form.invalid) return;

    const form = this.form.getRawValue();
    const p: PodcastDto = {
      id: form.id!,
      name: form.name,
      coverImageUrl: form.coverImageUrl!,
      coverImage: form.coverImage!,
      coverImagePreviewUrl: form.coverImagePreviewUrl!,
      coverImagePreview: form.coverImagePreview!,
      description: form.description!
    }
    this.isLoading.set(true);
    if (this.podcast()?.id != null) {
      this.podcastsService.update(this.podcast()!.id!, p).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toasterService.show('Podcast updated');
          this.load();
        },
        error: (err) => {
          console.error('podcastsService.update', this.podcast()!.id!, p, err);
          this.isLoading.set(false);
          this.toasterService.show('Podcast update failed', { type: 'error' });
        }
      });
    } else {
      this.podcastsService.create(p).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toasterService.show('Podcast created');
          this.router.navigate(['/edit', 'podcasts', res.id])
        },
        error: (err) => {
          console.error('podcastsService.update', p, err);
          this.isLoading.set(false);
          this.toasterService.show('Podcast create failed', { type: 'error' });
        }
      });

    }
  }

  delete() {
    this.dialogService.confirm('Delete Podcast', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          const id = this.podcast()!.id!;
          this.podcastsService.delete(id).subscribe({
            next: () => {
              this.toasterService.show('Podcast deleted');
              this.router.navigate(['/edit']);
            },
            error: (err) => {
              console.error('podcastsService.delete', id, err);
              this.toasterService.show('Podcast delete failed', { type: 'error' });
            }
          });
        }
      });
  }

  // Episodes
  deleteEpisode(episodeId: number) {
    this.dialogService.confirm('Delete Podcast Episode', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.podcastsService.deleteEpisode(this.podcast()!.id!, episodeId).subscribe({
            next: (res) => {
              this.load();
            },
            error: (err) => {
              console.error('podcastsService.deleteEpisode', this.podcast()!.id!, episodeId, err);
              this.toasterService.show('Delete Episode failed', { type: 'error' });
            }
          });
        }
      });
  }

  // Voicers
  addVoicer() {
    this.dialogService.open(CreatorSelectorDialog)
      .subscribe((creator: CreatorDto) => {
        if (creator) {
          this.podcastsService.addVoicer(this.podcast()!.id!, creator.id).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('podcastsService.addVoicer', this.podcast()!.id!, creator.id, err);
              this.toasterService.show('Add Voicer failed', { type: 'error' });
            }
          });
        }
      });
  }
  removeVoicer(voicerId: number) {
    this.dialogService.confirm('Remove Podcast Voicer', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.podcastsService.removeVoicer(this.podcast()!.id!, voicerId).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('podcastsService.removeVoicer', this.podcast()!.id!, voicerId, err);
              this.toasterService.show('Remove Voicer failed', { type: 'error' });
            }
          });
        }
      });
  }


}
