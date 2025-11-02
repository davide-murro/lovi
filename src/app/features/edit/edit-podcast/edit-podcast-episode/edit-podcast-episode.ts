import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PodcastEpisodeDto } from '../../../../core/models/dtos/podcast-episode-dto.model';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { faBackward, faForward, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PodcastsService } from '../../../../core/services/podcasts.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { CreatorDto } from '../../../../core/models/dtos/creator-dto.model';
import { ToasterService } from '../../../../core/services/toaster.service';
import { PodcastDto } from '../../../../core/models/dtos/podcast-dto.model';
import { CreatorSelectorDialog } from '../../../../shared/creator-selector-dialog/creator-selector-dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { UserDto } from '../../../../core/models/dtos/auth/user-dto.model';
import { passwordValidator } from '../../../../core/validators/password-validator';

@Component({
  selector: 'app-edit-podcast-episode',
  imports: [ReactiveFormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './edit-podcast-episode.html',
  styleUrl: './edit-podcast-episode.scss'
})
export class EditPodcastEpisode {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private podcastsService = inject(PodcastsService);

  faTrash = faTrash;
  faBackward = faBackward;
  faForward = faForward;

  private _episode: Signal<PodcastEpisodeDto | null> = toSignal(this.route.data.pipe(map(data => data['podcastEpisode'])));
  private _podcast: Signal<PodcastDto | null> = toSignal(this.route.data.pipe(map(data => data['podcast'])));

  episode = signal<PodcastEpisodeDto | null>(this._episode());
  podcast = signal<PodcastDto | null>(this._podcast());

  episodePrev = computed(() => this.episode()?.podcast!.episodes!.find(pe => pe.number == this.episode()!.number - 1));
  episodeNext = computed(() => this.episode()?.podcast!.episodes!.find(pe => pe.number == this.episode()!.number + 1));

  isLoading = signal(false);
  form = new FormGroup({
    id: new FormControl<number>({ value: null!, disabled: true }),
    number: new FormControl<number>(null!, { nonNullable: true, validators: [Validators.required] }),
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
    podcastId: new FormControl<number>(null!)
  });
  coverPreview = signal<string | null>(null);
  coverPreviewPreview = signal<string | null>(null);
  audioPreview = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.form.patchValue({
        id: this._episode()?.id,
        number: this._episode()?.number,
        name: this._episode()?.name,
        coverImageUrl: this._episode()?.coverImageUrl,
        coverImageValue: null,
        coverImage: null,
        coverImagePreviewUrl: this._episode()?.coverImagePreviewUrl,
        coverImagePreviewValue: null,
        coverImagePreview: null,
        description: this._episode()?.description,
        audioUrl: this._episode()?.audioUrl,
        audioValue: null,
        audio: null,
        podcastId: this._episode() ? this._episode()!.podcast!.id! : this._podcast()!.id!
      });
      this.coverPreview.set(this._episode()?.coverImageUrl ?? null);
      this.coverPreviewPreview.set(this._episode()?.coverImagePreviewUrl ?? null);
      this.audioPreview.set(this._episode()?.audioUrl ?? null);
      this.episode.set(this._episode());
    });
  }


  // episode
  prevEpisode() {
    this.router.navigate(['/edit', 'podcasts', this.episode()!.podcast!.id, 'episodes', this.episodePrev()!.id]);
  }
  nextEpisode() {
    this.router.navigate(['/edit', 'podcasts', this.episode()!.podcast!.id, 'episodes', this.episodeNext()!.id]);
  }

  load() {
    this.podcastsService.getEpisodeById(
      this.episode()!.podcast!.id!,
      this.episode()!.id!
    ).subscribe({
      next: (episode) => {
        this.episode.set(episode);
      },
      error: (err) => {
        console.error('podcastsService.getEpisodeById', this.episode()!.podcast!.id!, this.episode()!.id!, err);
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
    if (this.form.invalid) return;

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
    if (this.episode()?.id != null) {
      this.podcastsService.updateEpisode(this.episode()!.podcast!.id!, this.episode()!.id!, pe).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.toasterService.show('Podcast Episode updated');
          this.load();
        },
        error: (err) => {
          console.error('podcastsService.updateEpisode', this.episode()!.podcast!.id!, this.episode()!.id!, pe, err);
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
    this.dialogService.confirm('Delete Podcast Episode', 'Are you sure vecm?')
      .subscribe(confirmed => {
        if (confirmed) {
          const podcastId = this.episode()!.podcast!.id!;
          const id = this.episode()!.id!;
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
          this.podcastsService.addEpisodeVoicer(this.episode()!.podcast!.id!, this.episode()!.id!, creator.id).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('podcastsService.addEpisodeVoicer', this.episode()!.podcast!.id!, this.episode()!.id!, creator.id, err);
              this.toasterService.show('Add Episode Voicer failed', { type: 'error' });
            }
          });
        }
      });
  }
  removeVoicer(voicerId: number) {
    this.dialogService.confirm('Remove Podcast Episode Voicer', 'Are you sure vecm?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.podcastsService.removeEpisodeVoicer(this.episode()!.podcast!.id!, this.episode()!.id!, voicerId).subscribe({
            next: () => {
              this.load();
            },
            error: (err) => {
              console.error('podcastsService.removeEpisodeVoicer', this.episode()!.podcast!.id!, this.episode()!.id!, voicerId, err);
              this.toasterService.show('Remove Episode Voicer failed', { type: 'error' });
            }
          });
        }
      });
  }

}
