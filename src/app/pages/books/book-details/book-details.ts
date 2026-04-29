import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToasterService } from '../../../core/services/toaster.service';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { LibrariesService } from '../../../core/services/libraries.service';
import { faPlay, faPause, faList, faBookOpen, faBookBookmark, faDownload, faFileArrowDown, faCircleNotch, faBookReader } from '@fortawesome/free-solid-svg-icons';
import { OfflineService } from '../../../core/services/offline.service';
import { from } from 'rxjs';
import { AudioTrack } from '../../../core/models/audio-track.model';
import { ManageLibraryDto } from '../../../core/models/dtos/manage-library-dto.model';
import { BookDto } from '../../../core/models/dtos/book-dto.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthDirective } from '../../../core/directives/auth.directive';
import { SecureMediaDirective } from '../../../core/directives/secure-media.directive';
import { DialogService } from '../../../core/services/dialog.service';
import { FileBookReaderService } from '../../../core/services/file-book-reader.service';
import { FileBook } from '../../../core/models/file-book.model';

@Component({
  selector: 'app-book-details',
  imports: [FontAwesomeModule, RouterLink, AuthDirective, SecureMediaDirective],
  templateUrl: './book-details.html',
  styleUrl: './book-details.scss'
})
export class BookDetails {
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private audioPlayerService = inject(AudioPlayerService);
  private librariesService = inject(LibrariesService);
  private offlineService = inject(OfflineService);
  private fileBookReaderService = inject(FileBookReaderService);

  faPlay = faPlay;
  faPause = faPause;
  faList = faList;
  faBookOpen = faBookOpen;
  faBookBookmark = faBookBookmark;
  faDownload = faDownload;
  faFileArrowDown = faFileArrowDown;
  faCircleNotch = faCircleNotch;
  faBookReader = faBookReader;

  // book
  book = input.required<BookDto>();

  isOffline = computed(() => this.offlineService?.isBookDownloaded(this.book().id!) ?? false);
  isOfflineLoading = computed(() => (this.offlineService?.isBookDownloading(this.book().id!) || this.offlineService?.isBookDeleting(this.book().id!)) ?? false);
  isInMyLibrary = computed(() => this.librariesService?.myLibrary()?.some(l => l.book?.id === this.book().id));
  isMyLibraryLoading = computed(() => this.librariesService?.isLoading());

  isCurrentTrack = computed(() => this.book().audioUrl ? this.audioPlayerService.isCurrentAudioSrc(this.book().audioUrl!) : false);
  isCurrentTrackPlaying = computed(() => this.book().audioUrl ? this.audioPlayerService.isCurrentPlayingAudioSrc(this.book().audioUrl!) : false);
  isCurrentTrackLoading = computed(() => this.book().audioUrl ? this.audioPlayerService.isCurrentLoadingAudioSrc(this.book().audioUrl!) : false);

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
      title: this.book().name,
      artists: this.book().readers?.map(r => r.nickname),
      audioSrc: this.book().audioUrl!,
      coverImageSrc: this.book().coverImagePreviewUrl,
      referenceLink: `/books/${this.book().id}`
    };
    this.audioPlayerService.playTrack(audioBookTrack);
  }
  addToQueue() {
    const audioBookTrack: AudioTrack = {
      title: this.book().name,
      artists: this.book().readers?.map(r => r.nickname),
      audioSrc: this.book().audioUrl!,
      coverImageSrc: this.book().coverImagePreviewUrl,
      referenceLink: `/books/${this.book().id}`
    };
    this.audioPlayerService.addToQueue(audioBookTrack);
    this.toasterService.show($localize`"${this.book().name}" added to queue`);
  }

  // reader
  read() {
    const book = this.book();
    const fileBook: FileBook = {
      id: book.id,
      title: book.name,
      authors: book.writers?.map(r => r.nickname),
      fileSrc: book.fileUrl!,
      coverImageSrc: book.coverImagePreviewUrl,
      referenceLink: `/books/${book.id}`
    };
    this.fileBookReaderService.loadReader(fileBook);
  }

  // libraries
  toggleMyLibrary() {
    if (this.isInMyLibrary()) this.removeFromMyLibrary();
    else this.addToMyLibrary();
  }
  addToMyLibrary() {
    const bookLibrary: ManageLibraryDto = {
      bookId: this.book().id
    };

    this.librariesService!.createMe(bookLibrary).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.book().name}" added to My Library`);
      },
      error: (err) => {
        console.error('librariesService.createMe', bookLibrary, err);
        this.toasterService.show($localize`"${this.book().name}" adding to My Library failed`, { type: 'error' });
      }
    });
  }
  removeFromMyLibrary() {
    const id: number = this.librariesService!.myLibrary()!
      .find(ml => ml.book?.id == this.book().id)!.id!;

    this.librariesService!.deleteMe(id).subscribe({
      next: () => {
        this.toasterService.show($localize`"${this.book().name}" removed from My Library`);
      },
      error: (err) => {
        console.error('librariesService.deleteMe', id, err);
        this.toasterService.show($localize`"${this.book().name}" removing from My Library failed`, { type: 'error' });
      }
    });
  }

  // offline
  toggleOffline() {
    if (this.isOffline()) this.removeOffline();
    else this.addOffline();
  }
  addOffline() {
    this.dialogService.confirm(
      $localize`Download Book`,
      $localize`Are you sure you want to download "${this.book().name}"? It will take some time depending on your internet connection.`)
      .subscribe((res) => {
        if (res) {
          this.toasterService.show($localize`"${this.book().name}" downloading...`);
          from(this.offlineService!.downloadBook(this.book())).subscribe({
            next: () => {
              this.toasterService.show($localize`"${this.book().name}" added to Offline`, { type: 'success' });
            },
            error: (err) => {
              console.error('offlineService.downloadBook', this.book(), err);
              this.toasterService.show($localize`"${this.book().name}" adding to Offline failed`, { type: 'error' });
            }
          });
        }
      });
  }
  removeOffline() {
    this.dialogService.confirm(
      $localize`Remove Book`,
      $localize`Are you sure you want to remove "${this.book().name}" from Offline?`)
      .subscribe((res) => {
        if (res) {
          from(this.offlineService!.removeBook(this.book().id!)).subscribe({
            next: () => {
              this.toasterService.show($localize`"${this.book().name}" removed from Offline`);
            },
            error: (err) => {
              console.error('offlineService.removeBook', this.book().id!, err);
              this.toasterService.show($localize`"${this.book().name}" removing from Offline failed`, { type: 'error' });
            }
          });
        }
      });
  }
}
