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
  private _audioBook: Signal<AudioBookDto> = toSignal(this.route.data.pipe(map(data => data['audioBook'])));
  audioBookError = computed(() => this._audioBook() == null);
  audioBook = computed(() => {
    const p: AudioBookDto =
    {
      ...this._audioBook(),
      isInMyLibrary: this.librariesService.myLibrary()?.some(l => l.audioBook?.id === this._audioBook().id),
      isCurrentTrack: this.audioPlayerService.isCurrentAudioSrc(this._audioBook().audioUrl!),
      isCurrentTrackPlaying: this.audioPlayerService.isCurrentPlayingAudioSrc(this._audioBook().audioUrl!)
    }
    return p;
  });

  // audio player
  togglePlay() {
    if (this.audioBook().isCurrentTrackPlaying) this.pause();
    else if (this.audioBook().isCurrentTrack) this.play();
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
      title: this._audioBook().name,
      subtitle: this._audioBook().readers?.map(r => r.nickname).join(", "),
      audioSrc: this._audioBook().audioUrl!,
      coverImageSrc: this._audioBook().coverImageUrl,
      referenceLink: `/audio-books/${this._audioBook().id}`
    };
    this.audioPlayerService.playTrack(audioBookTrack);
  }
  addToQueue() {
    const audioBookTrack: AudioTrack = {
      id: null!,
      title: this._audioBook().name,
      subtitle: this._audioBook().readers?.map(r => r.nickname).join(", "),
      audioSrc: this._audioBook().audioUrl!,
      coverImageSrc: this._audioBook().coverImageUrl,
      referenceLink: `/audio-books/${this._audioBook().id}`
    };
    this.audioPlayerService.addToQueue(audioBookTrack);
    this.toasterService.show("Audio Book added to queue");
  }

  // libraries
  toggleMyLibrary() {
    if (this.audioBook().isInMyLibrary) this.removeFromMyLibrary();
    else this.addToMyLibrary();
  }
  addToMyLibrary() {
    const audioBookLibrary: ManageLibraryDto = {
      audioBookId: this._audioBook().id
    };

    this.librariesService.createMe(audioBookLibrary).subscribe({
      next: () => {
        this.toasterService.show('Added to My Library');
      },
      error: (err) => {
        this.toasterService.show('Adding to My Library failed', { type: 'error' });
        console.error('librariesService.createMe', audioBookLibrary, err)
      }
    });
  }
  removeFromMyLibrary() {
    const id: number = this.librariesService.myLibrary()!
      .find(ml => ml.audioBook?.id == this._audioBook().id)!.id!;

    this.librariesService.deleteMe(id).subscribe({
      next: () => {
        this.toasterService.show('Removed from My Library');
      },
      error: (err) => {
        this.toasterService.show('Removing from My Library failed', { type: 'error' });
        console.error('librariesService.deleteMe', id, err)
      }
    });
  }
}
