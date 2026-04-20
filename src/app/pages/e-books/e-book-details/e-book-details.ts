import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToasterService } from '../../../core/services/toaster.service';
import { LibrariesService } from '../../../core/services/libraries.service';
import { faBookOpen, faBookBookmark, faDownload, faFileArrowDown, faCircleNotch, faBookReader } from '@fortawesome/free-solid-svg-icons';
import { OfflineService } from '../../../core/services/offline.service';
import { from } from 'rxjs';
import { ManageLibraryDto } from '../../../core/models/dtos/manage-library-dto.model';
import { EBookDto } from '../../../core/models/dtos/e-book-dto.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthDirective } from '../../../core/directives/auth.directive';
import { SecureMediaDirective } from '../../../core/directives/secure-media.directive';
import { DialogService } from '../../../core/services/dialog.service';
import { FileBookReaderService } from '../../../core/services/file-book-reader.service';
import { FileBook } from '../../../core/models/file-book.model';

@Component({
  selector: 'app-e-book-details',
  imports: [FontAwesomeModule, RouterLink, AuthDirective, SecureMediaDirective],
  templateUrl: './e-book-details.html',
  styleUrl: './e-book-details.scss'
})
export class EBookDetails {
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private librariesService = inject(LibrariesService);
  private offlineService = inject(OfflineService);
  private fileBookReaderService = inject(FileBookReaderService);

  faBookOpen = faBookOpen;
  faBookBookmark = faBookBookmark;
  faDownload = faDownload;
  faFileArrowDown = faFileArrowDown;
  faCircleNotch = faCircleNotch;
  faBookReader = faBookReader;

  // eBook
  eBook = input.required<EBookDto>();

  isOffline = computed(() => this.offlineService?.isEBookDownloaded?.(this.eBook().id!) ?? false);
  isOfflineLoading = computed(() => (this.offlineService?.isEBookDownloading?.(this.eBook().id!) || this.offlineService?.isEBookDeleting?.(this.eBook().id!)) ?? false);
  isInMyLibrary = computed(() => this.librariesService?.myLibrary()?.some(l => l.eBook?.id === this.eBook().id));
  isMyLibraryLoading = computed(() => this.librariesService?.isLoading());

  // libraries
  toggleMyLibrary() {
    if (this.isInMyLibrary()) this.removeFromMyLibrary();
    else this.addToMyLibrary();
  }
  addToMyLibrary() {
    const eBookLibrary: ManageLibraryDto = {
      eBookId: this.eBook().id
    };

    this.librariesService!.createMe(eBookLibrary).subscribe({
      next: () => {
        this.toasterService.show(`"${this.eBook().name}" added to My Library`);
      },
      error: (err) => {
        console.error('librariesService.createMe', eBookLibrary, err);
        this.toasterService.show(`"${this.eBook().name}" adding to My Library failed`, { type: 'error' });
      }
    });
  }
  removeFromMyLibrary() {
    const id: number = this.librariesService!.myLibrary()!
      .find(ml => ml.eBook?.id == this.eBook().id)!.id!;

    this.librariesService!.deleteMe(id).subscribe({
      next: () => {
        this.toasterService.show(`"${this.eBook().name}" removed from My Library`);
      },
      error: (err) => {
        console.error('librariesService.deleteMe', id, err);
        this.toasterService.show(`"${this.eBook().name}" removing from My Library failed`, { type: 'error' });
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
      `Download eBook`,
      `Are you sure you want to download "${this.eBook().name}"? It will take some time depending on your internet connection.`)
      .subscribe((res) => {
        if (res) {
          this.toasterService.show(`"${this.eBook().name}" downloading...`);
          from(this.offlineService!.downloadEBook(this.eBook())).subscribe({
            next: () => {
              this.toasterService.show(`"${this.eBook().name}" added to Offline`, { type: 'success' });
            },
            error: (err) => {
              console.error('offlineService.downloadEBook', this.eBook(), err);
              this.toasterService.show(`"${this.eBook().name}" adding to Offline failed`, { type: 'error' });
            }
          });
        }
      });
  }
  removeOffline() {
    this.dialogService.confirm(
      `Remove eBook`,
      `Are you sure you want to remove "${this.eBook().name}" from Offline?`)
      .subscribe((res) => {
        if (res) {
          from(this.offlineService!.removeEBook(this.eBook().id!)).subscribe({
            next: () => {
              this.toasterService.show(`"${this.eBook().name}" removed from Offline`);
            },
            error: (err) => {
              console.error('offlineService.removeEBook', this.eBook().id!, err);
              this.toasterService.show(`"${this.eBook().name}" removing from Offline failed`, { type: 'error' });
            }
          });
        }
      });
  }

  read() {
    const ebook = this.eBook();
    const fileBook: FileBook = {
      id: ebook.id,
      title: ebook.name,
      authors: ebook.writers?.map(r => r.nickname),
      fileSrc: ebook.fileUrl!,
      coverImageSrc: ebook.coverImageUrl,
      referenceLink: `/e-books/${ebook.id}`
    };
    this.fileBookReaderService.initReader(fileBook);
  }
}
