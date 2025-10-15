import { Component, inject, signal } from '@angular/core';
import { PodcastDto } from '../../../core/models/dtos/podcast-dto.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAdd, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { PodcastsService } from '../../../core/services/podcasts.service';
import { DialogService } from '../../../core/services/dialog.service';
import { SelectCreatorDialog } from '../select-creator-dialog/select-creator-dialog';
import { CreatorDto } from '../../../core/models/dtos/creator-dto.model';
import { ToasterService } from '../../../core/services/toaster.service';

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

  podcast = signal<PodcastDto | null>(this.route.snapshot.data['podcast']);

  form = new FormGroup({
    id: new FormControl<number | null>({ value: this.podcast()?.id ?? null, disabled: true }),
    name: new FormControl<string>(this.podcast()?.name ?? null!, { nonNullable: true, validators: [Validators.required] }),
    coverImageUrl: new FormControl<string | null>(this.podcast()?.coverImageUrl ?? null),
    coverImage: new FormControl<File | null>(null),
    description: new FormControl<string | null>(this.podcast()?.description ?? null),
  });
  coverPreview = signal<string | null>(this.podcast()?.coverImageUrl ?? null);


  load() {
    this.podcastsService.getById(
      this.podcast()!.id!
    ).subscribe(
      {
        next: (podcast) => {
          this.podcast.set(podcast);
        },
        error: (err) => {
          this.toasterService.show('Get Podcast failed', { type: 'error' });
          console.error('podcastsService.getById', this.podcast()!.id!, err);
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
  onSubmit() {
    if (this.form.invalid) return;

    const form = this.form.getRawValue();
    const p: PodcastDto = {
      id: form.id!,
      name: form.name,
      coverImageUrl: form.coverImageUrl!,
      coverImage: form.coverImage!,
      description: form.description!
    }
    if (this.podcast()?.id != null) {
      this.podcastsService.update(this.podcast()!.id!, p).subscribe({
        next: (res) => {
          this.toasterService.show('Podcast updated');
          this.load();
        },
        error: (err) => {
          this.toasterService.show('Podcast update failed', { type: 'error' });
          console.error('podcastsService.update', this.podcast()!.id!, p, err);
        }
      });
    } else {
      this.podcastsService.create(p).subscribe({
        next: (res) => {
          this.toasterService.show('Podcast created');
          this.router.navigate(['/edit', 'podcasts', res.id])
        },
        error: (err) => {
          this.toasterService.show('Podcast create failed', { type: 'error' });
          console.error('podcastsService.update', p, err);
        }
      });

    }
  }

  // Episodes
  deleteEpisode(episodeId: number) {
    this.dialogService.confirm('Delete Podcast Episode', 'Are you sure vecm?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.podcastsService.deleteEpisode(this.podcast()!.id!, episodeId).subscribe({
            next: (res) => {
              this.load();
            },
            error: (err) => {
              this.toasterService.show('Delete Episode failed', { type: 'error' });
              console.error('podcastsService.deleteEpisode', this.podcast()!.id!, episodeId, err);
            }
          });
        }
      });
  }

  // Voicers
  addVoicer() {
    this.dialogService.open(SelectCreatorDialog)
      .subscribe((creator: CreatorDto) => {
        if (creator) {
          this.podcastsService.addVoicer(this.podcast()!.id!, creator.id).subscribe({
            next: (res) => {
              this.load();
            },
            error: (err) => {
              this.toasterService.show('Add Voicer failed', { type: 'error' });
              console.error('podcastsService.addVoicer', this.podcast()!.id!, creator.id, err);
            }
          });
        }
      });
  }
  removeVoicer(voicerId: number) {
    this.dialogService.confirm('Remove Podcast Voicer', 'Are you sure vecm?')
      .subscribe(confirmed => {
        if (confirmed) {
          this.podcastsService.removeVoicer(this.podcast()!.id!, voicerId).subscribe({
            next: (res) => {
              this.load();
            },
            error: (err) => {
              this.toasterService.show('Remove Voicer failed', { type: 'error' });
              console.error('podcastsService.removeVoicer', this.podcast()!.id!, voicerId, err);
            }
          });
        }
      });
  }


}
