import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PodcastEpisodeDto } from '../../../../core/models/dtos/podcast-episode-dto.model';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PodcastsService } from '../../../../core/services/podcasts.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { CreatorDto } from '../../../../core/models/dtos/creator-dto.model';
import { ToasterService } from '../../../../core/services/toaster.service';
import { PodcastDto } from '../../../../core/models/dtos/podcast-dto.model';
import { CreatorSelectorDialog } from '../../../../shared/creator-selector-dialog/creator-selector-dialog';

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

  episode = signal<PodcastEpisodeDto | null>(this.route.snapshot.data['podcastEpisode']);
  podcast = signal<PodcastDto | null>(this.route.snapshot.data['podcast']);

  form = new FormGroup({
    id: new FormControl({ value: this.episode()?.id, disabled: true }),
    number: new FormControl(this.episode()?.number, { nonNullable: true, validators: [Validators.required] }),
    name: new FormControl(this.episode()?.name, { nonNullable: true, validators: [Validators.required] }),
    coverImageUrl: new FormControl(this.episode()?.coverImageUrl),
    coverImage: new FormControl<File | null>(null),
    description: new FormControl(this.episode()?.description),
    audioUrl: new FormControl(this.episode()?.audioUrl),
    audio: new FormControl<File | null>(null),
    podcastId: new FormControl(this.episode() ? this.episode()!.podcast!.id! : this.podcast()!.id!)
  });
  coverPreview = signal(this.episode()?.coverImageUrl ?? null);
  audioPreview = signal(this.episode()?.audioUrl ?? null);


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
      description: form.description!,
      audioUrl: form.audioUrl!,
      audio: form.audio!,
      podcastId: form.podcastId!
    };

    if (this.episode()?.id != null) {
      this.podcastsService.updateEpisode(this.episode()!.podcast!.id!, this.episode()!.id!, pe).subscribe({
        next: () => {
          this.toasterService.show('Podcast Episode updated');
          this.load();
        },
        error: (err) => {
          console.error('podcastsService.updateEpisode', this.episode()!.podcast!.id!, this.episode()!.id!, pe, err);
          this.toasterService.show('Podcast Episode update failed', { type: 'error' });
        }
      });
    } else {
      pe.podcastId = this.podcast()!.id!;
      this.podcastsService.createEpisode(pe.podcastId, pe).subscribe({
        next: (res) => {
          this.toasterService.show('Podcast Episode created');
          this.router.navigate(['/edit', 'podcasts', res.podcastId, 'episodes', res.id])
        },
        error: (err) => {
          console.error('podcastsService.createEpisode', pe.podcastId, pe, err);
          this.toasterService.show('Podcast Episode create failed', { type: 'error' });
        }
      });

    }
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
