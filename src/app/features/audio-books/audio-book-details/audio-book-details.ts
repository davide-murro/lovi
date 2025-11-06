import { Component, computed, inject, Signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToasterService } from '../../../core/services/toaster.service';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { LibrariesService } from '../../../core/services/libraries.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { faPlay, faPause, faList, faBookOpen, faBookBookmark } from '@fortawesome/free-solid-svg-icons';
import { map, tap } from 'rxjs';
import { AudioTrack } from '../../../core/models/audio-track.model';
import { ManageLibraryDto } from '../../../core/models/dtos/manage-library-dto.model';
import { AudioBookDto } from '../../../core/models/dtos/audio-book-dto.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthDirective } from '../../../core/directives/auth.directive';

@Component({
  selector: 'app-audio-book-details',
  imports: [FontAwesomeModule, RouterLink, AuthDirective],
  templateUrl: './audio-book-details.html',
  styleUrl: './audio-book-details.scss'
})
export class AudioBookDetails {
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private audioPlayerService = inject(AudioPlayerService);
  private librariesService = inject(LibrariesService);

  faPlay = faPlay;
  faPause = faPause;
  faList = faList;
  faBookOpen = faBookOpen;
  faBookBookmark = faBookBookmark;

  // audioBook
  audioBook: Signal<AudioBookDto> = toSignal(this.route.data.pipe(map(data => data['audioBook'])));

  isInMyLibrary = computed(() => this.librariesService.myLibrary()?.some(l => l.audioBook?.id === this.audioBook().id));
  isCurrentTrack = computed(() => this.audioPlayerService.isCurrentAudioSrc(this.audioBook().audioUrl!));
  isCurrentTrackPlaying = computed(() => this.audioPlayerService.isCurrentPlayingAudioSrc(this.audioBook().audioUrl!));

  // audio player
  togglePlay() {
    if (this.isCurrentTrackPlaying()) this.pause();
    else if (this.isCurrentTrack()) this.play();
    else this.playAll();
  }
  play() {
    this.audioPlayerService.play();
  }
  pause() {
    this.audioPlayerService.pause();
  }
  playAll() {
    const audioBookTrack: AudioTrack = {
      id: null!,
      title: this.audioBook().name,
      subtitle: this.audioBook().readers?.map(r => r.nickname).join(", "),
      audioSrc: this.audioBook().audioUrl!,
      coverImageSrc: this.audioBook().coverImagePreviewUrl,
      referenceLink: `/audio-books/${this.audioBook().id}`
    };
    this.audioPlayerService.playTrack(audioBookTrack);
  }
  addToQueue() {
    const audioBookTrack: AudioTrack = {
      id: null!,
      title: this.audioBook().name,
      subtitle: this.audioBook().readers?.map(r => r.nickname).join(", "),
      audioSrc: this.audioBook().audioUrl!,
      coverImageSrc: this.audioBook().coverImagePreviewUrl,
      referenceLink: `/audio-books/${this.audioBook().id}`
    };
    this.audioPlayerService.addToQueue(audioBookTrack);
    this.toasterService.show($localize`Audio Book added to queue`);
  }

  // libraries
  toggleMyLibrary() {
    if (this.isInMyLibrary()) this.removeFromMyLibrary();
    else this.addToMyLibrary();
  }
  addToMyLibrary() {
    const audioBookLibrary: ManageLibraryDto = {
      audioBookId: this.audioBook().id
    };

    this.librariesService.createMe(audioBookLibrary).subscribe({
      next: () => {
        this.toasterService.show($localize`Added to My Library`);
      },
      error: (err) => {
        console.error('librariesService.createMe', audioBookLibrary, err);
        this.toasterService.show($localize`Adding to My Library failed`, { type: 'error' });
      }
    });
  }
  removeFromMyLibrary() {
    const id: number = this.librariesService.myLibrary()!
      .find(ml => ml.audioBook?.id == this.audioBook().id)!.id!;

    this.librariesService.deleteMe(id).subscribe({
      next: () => {
        this.toasterService.show($localize`Removed from My Library`);
      },
      error: (err) => {
        console.error('librariesService.deleteMe', id, err);
        this.toasterService.show($localize`Removing from My Library failed`, { type: 'error' });
      }
    });
  }
}
