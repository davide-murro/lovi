import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PodcastEpisodeDto } from '../../../../core/models/dtos/podcast-episode-dto.model';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { faBackward, faForward, faRefresh, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PodcastsService } from '../../../../core/services/podcasts.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { CreatorDto } from '../../../../core/models/dtos/creator-dto.model';
import { ToasterService } from '../../../../core/services/toaster.service';
import { PodcastDto } from '../../../../core/models/dtos/podcast-dto.model';
import { CreatorSelectorDialog } from '../../../../shared/creator-selector-dialog/creator-selector-dialog';
import { SecureMediaDirective } from '../../../../core/directives/secure-media.directive';

@Component({
  selector: 'app-edit-podcast-episode',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink, SecureMediaDirective],
  templateUrl: './edit-podcast-episode.html',
  styleUrl: './edit-podcast-episode.scss'
})
export class EditPodcastEpisode {
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private podcastsService = inject(PodcastsService);

  faTrash = faTrash;
  faBackward = faBackward;
  faForward = faForward;
  faRefresh = faRefresh;

  podcast = input.required<PodcastDto>();
  podcastEpisode = input<PodcastEpisodeDto>();
  podcastEpisodeEdit = signal<PodcastEpisodeDto | undefined>(this.podcastEpisode());

  currentIndex = computed(() => this.podcastEpisodeEdit() ? this.podcast().episodes!.findIndex(pe => pe.number == this.podcastEpisodeEdit()!.number) : null);
  episodePrev = computed(() => this.currentIndex() != null ? (this.podcast().episodes![this.currentIndex()! - 1] ?? null) : null);
  episodeNext = computed(() => this.currentIndex() != null ? (this.podcast().episodes![this.currentIndex()! + 1] ?? null) : null);

  isLoading = signal(false);
  form = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    number: new FormControl<number | null>(null, { nonNullable: true, validators: [Validators.required] }),
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
    podcastId: new FormControl<number | null>(null)
  });
  coverPreview = signal<string | null>(null);
  coverPreviewPreview = signal<string | null>(null);
  audioPreview = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.form.patchValue({
        id: this.podcastEpisode()?.id,
        number: this.podcastEpisode()?.number,
        name: this.podcastEpisode()?.name,
        coverImageUrl: this.podcastEpisode()?.coverImageUrl,
        coverImageValue: null,
        coverImage: null,
        coverImagePreviewUrl: this.podcastEpisode()?.coverImagePreviewUrl,
        coverImagePreviewValue: null,
        coverImagePreview: null,
        description: this.podcastEpisode()?.description,
        audioUrl: this.podcastEpisode()?.audioUrl,
        audioValue: null,
        audio: null,
        podcastId: this.podcast()!.id!
      });
      this.coverPreview.set(this.podcastEpisode()?.coverImageUrl ?? null);
      this.coverPreviewPreview.set(this.podcastEpisode()?.coverImagePreviewUrl ?? null);
      this.audioPreview.set(this.podcastEpisode()?.audioUrl ?? null);
      this.podcastEpisodeEdit.set(this.podcastEpisode());
    });
  }


  // episode
  load() {
    this.podcastsService.getEpisodeById(
      this.podcast()!.id!,
      this.podcastEpisodeEdit()!.id!
    ).subscribe({
      next: (episode) => {
        this.podcastEpisodeEdit.set(episode);
      },
      error: (err) => {
        console.error('podcastsService.getEpisodeById', this.podcast()!.id!, this.podcastEpisodeEdit()!.id!, err);
        this.toasterService.show('Get Podcast Episode failed', { type: 'error' });
      }
    });
  }

  // episode form
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

  onSubmit() {
    if (!this.form.valid) return;

    const form = this.form.getRawValue();
    const pe: PodcastEpisodeDto = {
      id: form.id!,
      number: form.number!,
      name: form.name!,
      coverImageUrl: form.coverImageUrl!,
      coverImage: form.coverImage!,
      coverImagePreviewUrl: form.coverImagePreviewUrl!,
      coverImagePreview: form.coverImagePreview!,
      description: form.description!,
      audioUrl: form.audioUrl!,
      audio: form.audio!,
      podcastId: form.podcastId!
    };

    this.isLoading.set(true);
    if (this.podcastEpisodeEdit()?.id != null) {
      this.podcastsService.updateEpisode(this.podcast()!.id!, this.podcastEpisodeEdit()!.id!, pe).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toasterService.show('Podcast Episode updated');
          this.load();
        },
        error: (err) => {
          console.error('podcastsService.updateEpisode', this.podcast()!.id!, this.podcastEpisodeEdit()!.id!, pe, err);
          this.isLoading.set(false);
          this.toasterService.show('Podcast Episode update failed', { type: 'error' });
        }
      });
    } else {
      pe.podcastId = this.podcast()!.id!;
      this.podcastsService.createEpisode(pe.podcastId, pe).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.toasterService.show('Podcast Episode created');
          this.router.navigate(['/edit', 'podcasts', res.podcastId, 'episodes', res.id])
        },
        error: (err) => {
          console.error('podcastsService.createEpisode', pe.podcastId, pe, err);
          this.isLoading.set(false);
          this.toasterService.show('Podcast Episode create failed', { type: 'error' });
        }
      });

    }
  }

  delete() {
    this.dialogService.confirm('Delete Podcast Episode', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          const podcastId = this.podcast()!.id!;
          const id = this.podcastEpisodeEdit()!.id!;
          this.podcastsService.deleteEpisode(podcastId, id).subscribe({
            next: () => {
              this.toasterService.show('Podcast Episode deleted');
              this.router.navigate(['/edit', 'podcasts', podcastId]);
            },
            error: (err) => {
              console.error('podcastsService.deleteEpisode', podcastId, id, err);
              this.toasterService.show('Podcast Episode delete failed', { type: 'error' });
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
          this.podcastsService.addEpisodeVoicer(this.podcast()!.id!, this.podcastEpisodeEdit()!.id!, creator.id!).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('podcastsService.addEpisodeVoicer', this.podcast()!.id!, this.podcastEpisodeEdit()!.id!, creator.id, err);
              this.toasterService.show('Add Episode Voicer failed', { type: 'error' });
            }
          });
        }
      });
  }
  removeVoicer(voicerId: number) {
    this.dialogService.confirm('Remove Podcast Episode Voicer', 'Are you sure?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.podcastsService.removeEpisodeVoicer(this.podcast()!.id!, this.podcastEpisodeEdit()!.id!, voicerId).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('podcastsService.removeEpisodeVoicer', this.podcast()!.id!, this.podcastEpisodeEdit()!.id!, voicerId, err);
              this.toasterService.show('Remove Episode Voicer failed', { type: 'error' });
            }
          });
        }
      });
  }

}
