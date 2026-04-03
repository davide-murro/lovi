import { Component, computed, inject, input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToasterService } from '../../../core/services/toaster.service';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { LibrariesService } from '../../../core/services/libraries.service';
import { faPlay, faPause, faList, faBookOpen, faBookBookmark, faFileArrowDown, faFile, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { OfflineService } from '../../../core/services/offline.service';
import { from } from 'rxjs';
import { AudioTrack } from '../../../core/models/audio-track.model';
import { ManageLibraryDto } from '../../../core/models/dtos/manage-library-dto.model';
import { AudioBookDto } from '../../../core/models/dtos/audio-book-dto.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthDirective } from '../../../core/directives/auth.directive';
import { SecureMediaDirective } from '../../../core/directives/secure-media.directive';

@Component({
  selector: 'app-audio-book-details',
  imports: [FontAwesomeModule, RouterLink, AuthDirective, SecureMediaDirective],
  templateUrl: './audio-book-details.html',
  styleUrl: './audio-book-details.scss'
})
export class AudioBookDetails {
  private toasterService = inject(ToasterService);
  private audioPlayerService = inject(AudioPlayerService);
  private librariesService = inject(LibrariesService);
  private offlineService = inject(OfflineService);

  faPlay = faPlay;
  faPause = faPause;
  faList = faList;
  faBookOpen = faBookOpen;
  faBookBookmark = faBookBookmark;
  faFileArrowDown = faFileArrowDown;
  faFile = faFile;
  faCircleNotch = faCircleNotch;

  // audioBook
  audioBook = input.required<AudioBookDto>();

  isOffline = computed(() => this.offlineService?.isAudioBookDownloaded(this.audioBook().id!) ?? false);
  isOfflineLoading = computed(() => (this.offlineService?.isAudioBookDownloading(this.audioBook().id!) || this.offlineService?.isAudioBookDeleting(this.audioBook().id!)) ?? false);
  isInMyLibrary = computed(() => this.librariesService?.myLibrary()?.some(l => l.audioBook?.id === this.audioBook().id));
  isMyLibraryLoading = computed(() => this.librariesService?.isLoading());
  isCurrentTrack = computed(() => this.audioPlayerService.isCurrentAudioSrc(this.audioBook().audioUrl!));
  isCurrentTrackPlaying = computed(() => this.audioPlayerService.isCurrentPlayingAudioSrc(this.audioBook().audioUrl!));
  isCurrentTrackLoading = computed(() => this.audioPlayerService.isCurrentLoadingAudioSrc(this.audioBook().audioUrl!));

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
      title: this.audioBook().name,
      artists: this.audioBook().readers?.map(r => r.nickname),
      audioSrc: this.audioBook().audioUrl!,
      coverImageSrc: this.audioBook().coverImagePreviewUrl,
      referenceLink: `/audio-books/${this.audioBook().id}`
    };
    this.audioPlayerService.playTrack(audioBookTrack);
  }
  addToQueue() {
    const audioBookTrack: AudioTrack = {
      title: this.audioBook().name,
      artists: this.audioBook().readers?.map(r => r.nickname),
      audioSrc: this.audioBook().audioUrl!,
      coverImageSrc: this.audioBook().coverImagePreviewUrl,
      referenceLink: `/audio-books/${this.audioBook().id}`
    };
    this.audioPlayerService.addToQueue(audioBookTrack);
    this.toasterService.show($localize`"${this.audioBook().name}" added to queue`);
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

    this.librariesService!.createMe(audioBookLibrary).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.audioBook().name}" added to My Library`);
      },
      error: (err) => {
        console.error('librariesService.createMe', audioBookLibrary, err);
        this.toasterService.show($localize`"${this.audioBook().name}" adding to My Library failed`, { type: 'error' });
      }
    });
  }
  removeFromMyLibrary() {
    const id: number = this.librariesService!.myLibrary()!
      .find(ml => ml.audioBook?.id == this.audioBook().id)!.id!;

    this.librariesService!.deleteMe(id).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.audioBook().name}" removed from My Library`);
      },
      error: (err) => {
        console.error('librariesService.deleteMe', id, err);
        this.toasterService.show($localize`"${this.audioBook().name}" removing from My Library failed`, { type: 'error' });
      }
    });
  }

  // offline
  toggleOffline() {
    if (this.isOffline()) this.removeOffline();
    else this.addOffline();
  }
  addOffline() {
    this.toasterService.show($localize`"${this.audioBook().name}" downloading...`);
    from(this.offlineService!.downloadAudioBook(this.audioBook())).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.audioBook().name}" added to offline`, { type: 'success' });
      },
      error: (err) => {
        console.error('offlineService.downloadAudioBook', this.audioBook(), err);
        this.toasterService.show($localize`"${this.audioBook().name}" adding to offline failed`, { type: 'error' });
      }
    });
  }
  removeOffline() {
    from(this.offlineService!.removeAudioBook(this.audioBook().id!)).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.audioBook().name}" removed from offline`);
      },
      error: (err) => {
        console.error('offlineService.removeAudioBook', this.audioBook().id!, err);
        this.toasterService.show($localize`"${this.audioBook().name}" removing from offline failed`, { type: 'error' });
      }
    });
  }
}
