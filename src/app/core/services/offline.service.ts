import { effect, inject, Injectable, signal, computed } from '@angular/core';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { BookDto } from '../models/dtos/book-dto.model';
import { PodcastEpisodeDto } from '../models/dtos/podcast-episode-dto.model';
import { BooksService } from './books.service';
import { PodcastsService } from './podcasts.service';
import { AuthService } from './auth.service';
import { PodcastDto } from '../models/dtos/podcast-dto.model';

@Injectable({
    providedIn: 'root'
})
export class OfflineService {
    private authService = inject(AuthService);
    private booksService = inject(BooksService);
    private podcastsService = inject(PodcastsService);
    //private creatorsService = inject(CreatorsService);

    // Track downloaded items with metadata
    private offlineBooks = signal<BookDto[]>([]);
    private offlineEpisodes = signal<PodcastEpisodeDto[]>([]);

    // Track items being downloaded (priming phase) to allow services to add ?isOffline=true
    private downloadingBooks = signal<BookDto[]>([]);
    private downloadingEpisodes = signal<PodcastEpisodeDto[]>([]);

    // Track items being deleted (priming phase)
    private deletingBooks = signal<BookDto[]>([]);
    private deletingEpisodes = signal<PodcastEpisodeDto[]>([]);

    // Subject to cancel ongoing downloads when user logs out
    private cancelDownloads$ = new Subject<void>();

    books = computed(() => [...this.downloadingBooks(), ...this.offlineBooks()]);
    episodes = computed(() => [...this.downloadingEpisodes(), ...this.offlineEpisodes()]);
    podcasts = computed(() => {
        const grouped = this.episodes().reduce((acc, ep) => {
            const pToFind = ep.podcast!;
            const pFound = acc.find(a => a.id === pToFind.id);
            if (pFound) pFound.episodes!.push(ep);
            else acc.push({ ...pToFind, episodes: [ep] });
            return acc;
        }, [] as PodcastDto[]);
        return grouped;
    });
    creators = computed(() => {
        const creators = Array.from(
            new Map(
                [
                    ...this.books().flatMap(b => [...(b.readers ?? []), ...(b.writers ?? [])]),
                    ...this.episodes().flatMap(ep => ep.voicers ?? [])
                ].map(c => [c.id, c])
            ).values()
        );
        return creators;
    });

    constructor() {
        effect(() => {
            if (this.authService.isLoggedIn()) {
                this.requestPersistentStorage();
                this.initializeOfflineData();
            }
            else this.clearOfflineData();
        });
    }

    private async requestPersistentStorage() {
        if (navigator.storage && navigator.storage.persist) {
            const isPersisted = await navigator.storage.persisted();
            if (!isPersisted) {
                await navigator.storage.persist();
            }
        }
    }

    private initializeOfflineData() {
        this.cancelDownloads$.next();
        this.offlineBooks.set(this.loadFromStorage('offlineBooks'));
        this.offlineEpisodes.set(this.loadFromStorage('offlinePodcastEpisodes'));
        this.downloadingBooks.set([]);
        this.downloadingEpisodes.set([]);
        this.deletingBooks.set([]);
        this.deletingEpisodes.set([]);
    }

    private clearOfflineData() {
        this.cancelDownloads$.next();
        this.offlineBooks.set([]);
        this.offlineEpisodes.set([]);
        this.downloadingBooks.set([]);
        this.downloadingEpisodes.set([]);
        this.deletingBooks.set([]);
        this.deletingEpisodes.set([]);
    }

    private loadFromStorage(key: string): any[] {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
            return [];
        }
    }

    private saveToStorage(key: string, data: any[]) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch { }
    }

    private addOfflineToUrl(url: string) {
        if (!url) return url;
        if (url.includes('isOffline=')) return url;
        return url.includes('?') ? `${url}&isOffline=True` : `${url}?isOffline=True`;
    }

    isUrlDownloaded(url: string): boolean {
        if (!url) return false;

        if (this.offlineBooks().some(b => {
            if (this.isBookDeleting(b.id!)) return false;
            let found = b.dataUrl === url || b.audioUrl === url || b.fileUrl === url || b.coverImageUrl === url || b.coverImagePreviewUrl === url
            if (b.readers) {
                for (const r of b.readers) {
                    found = found || r.dataUrl === url || r.coverImageUrl === url || r.coverImagePreviewUrl === url
                }
            }
            if (b.writers) {
                for (const w of b.writers) {
                    found = found || w.dataUrl === url || w.coverImageUrl === url || w.coverImagePreviewUrl === url
                }
            }
            return found;
        })) {
            return true;
        }

        if (this.offlineEpisodes().some(e => {
            if (this.isPodcastEpisodeDeleting(e.id!)) return false;
            let found = e.dataUrl === url || e.audioUrl === url || e.coverImageUrl === url || e.coverImagePreviewUrl === url
            if (e.podcast) {
                found = found || e.podcast.dataUrl === url || e.podcast.coverImageUrl === url || e.podcast.coverImagePreviewUrl === url
            }
            if (e.voicers) {
                for (const v of e.voicers) {
                    found = found || v.dataUrl === url || v.coverImageUrl === url || v.coverImagePreviewUrl === url
                }
            }
            return found;
        })) {
            return true;
        }

        return false;
    }

    isUrlDownloading(url: string): boolean {
        if (!url) return false;

        if (this.downloadingBooks().some(b => {
            let found = b.dataUrl === url || b.audioUrl === url || b.fileUrl === url || b.coverImageUrl === url || b.coverImagePreviewUrl === url
            if (b.readers) {
                for (const r of b.readers) {
                    found = found || r.dataUrl === url || r.coverImageUrl === url || r.coverImagePreviewUrl === url
                }
            }
            if (b.writers) {
                for (const w of b.writers) {
                    found = found || w.dataUrl === url || w.coverImageUrl === url || w.coverImagePreviewUrl === url
                }
            }
            return found;
        })) {
            return true;
        }

        if (this.downloadingEpisodes().some(e => {
            let found = e.dataUrl === url || e.audioUrl === url || e.coverImageUrl === url || e.coverImagePreviewUrl === url
            if (e.podcast) {
                found = found || e.podcast.dataUrl === url || e.podcast.coverImageUrl === url || e.podcast.coverImagePreviewUrl === url
            }
            if (e.voicers) {
                for (const v of e.voicers) {
                    found = found || v.dataUrl === url || v.coverImageUrl === url || v.coverImagePreviewUrl === url
                }
            }
            return found;
        })) {
            return true;
        }

        return false;
    }

    isUrlDeleting(url: string): boolean {
        if (!url) return false;

        const offlineBooks = this.offlineBooks().filter(b => {
            let found = b.dataUrl === url || b.audioUrl === url || b.fileUrl === url || b.coverImageUrl === url || b.coverImagePreviewUrl === url
            if (b.readers) {
                for (const r of b.readers) {
                    found = found || r.dataUrl === url || r.coverImageUrl === url || r.coverImagePreviewUrl === url
                }
            }
            if (b.writers) {
                for (const w of b.writers) {
                    found = found || w.dataUrl === url || w.coverImageUrl === url || w.coverImagePreviewUrl === url
                }
            }
            return found;
        });
        if (offlineBooks.length > 0 && offlineBooks.every(b => this.isBookDeleting(b.id!))) {
            return true;
        }

        const offlinePodcastEpisodes = this.offlineEpisodes().filter(e => {
            let found = e.dataUrl === url || e.audioUrl === url || e.coverImageUrl === url || e.coverImagePreviewUrl === url
            if (e.podcast) {
                found = found || e.podcast.dataUrl === url || e.podcast.coverImageUrl === url || e.podcast.coverImagePreviewUrl === url
            }
            if (e.voicers) {
                for (const v of e.voicers) {
                    found = found || v.dataUrl === url || v.coverImageUrl === url || v.coverImagePreviewUrl === url
                }
            }
            return found;
        });
        if (offlinePodcastEpisodes.length > 0 && offlinePodcastEpisodes.every(e => this.isPodcastEpisodeDeleting(e.id!))) {
            return true;
        }

        return false;
    }

    isBookDownloaded(id: number): boolean {
        if (!id) return false;
        return this.offlineBooks().some(b => b.id === id) && !this.isBookDeleting(id);
    }

    isPodcastEpisodeDownloaded(id: number): boolean {
        if (!id) return false;
        return this.offlineEpisodes().some(e => e.id === id) && !this.isPodcastEpisodeDeleting(id);
    }

    isPodcastDownloaded(id: number): boolean {
        if (!id) return false;
        // A podcast is "offline" if any of its episodes are offline or being downloaded
        return this.offlineEpisodes().some(e => e.podcast?.id === id) && !this.isPodcastDeleting(id);
    }

    isCreatorDownloaded(id: number): boolean {
        if (!id) return false;
        // A creator is "offline" if they are part of any offline book or episode
        return (this.offlineBooks().some(b => (b.readers?.some(r => r.id === id) || b.writers?.some(w => w.id === id))) ||
            this.offlineEpisodes().some(e => e.voicers?.some(v => v.id === id))) &&
            !this.isCreatorDeleting(id);
    }

    isBookDownloading(id: number): boolean {
        if (!id) return false;
        return this.downloadingBooks().some(b => b.id === id);
    }

    isPodcastEpisodeDownloading(id: number): boolean {
        if (!id) return false;
        return this.downloadingEpisodes().some(e => e.id === id);
    }

    isPodcastDownloading(id: number): boolean {
        if (!id) return false;
        return this.downloadingEpisodes().some(e => e.podcast?.id === id);
    }

    isCreatorDownloading(id: number): boolean {
        if (!id) return false;
        return this.downloadingEpisodes().some(e => e.voicers?.some(v => v.id === id)) ||
            this.downloadingBooks().some(b => (b.readers?.some(r => r.id === id) || b.writers?.some(w => w.id === id)));
    }

    isBookDeleting(id: number): boolean {
        if (!id) return false;
        return this.deletingBooks().some(b => b.id === id);
    }

    isPodcastEpisodeDeleting(id: number): boolean {
        if (!id) return false;
        return this.deletingEpisodes().some(e => e.id === id);
    }

    isPodcastDeleting(id: number): boolean {
        if (!id) return false;
        const offlinePodcastEpisodes = this.offlineEpisodes().filter(e => e.podcast?.id === id);
        return offlinePodcastEpisodes.length > 0 && offlinePodcastEpisodes.every(e => this.isPodcastEpisodeDeleting(e.id!));
    }

    isCreatorDeleting(id: number): boolean {
        if (!id) return false;
        const offlinePodcastEpisodes = this.offlineEpisodes().filter(e => e.voicers?.some(v => v.id === id));
        const offlineBooks = this.offlineBooks().filter(b => (b.readers?.some(r => r.id === id) || b.writers?.some(w => w.id === id)));
        return offlinePodcastEpisodes.length > 0 && offlinePodcastEpisodes.every(e => this.isPodcastEpisodeDeleting(e.id!)) ||
            offlineBooks.length > 0 && offlineBooks.every(b => this.isBookDeleting(b.id!));
    }

    async downloadBook(book: BookDto) {
        if (!book.id) return;

        if (this.isBookDownloaded(book.id!)) {
            throw new Error(`${book.name} is already Offline`);
        }
        if (this.isBookDownloading(book.id!)) {
            throw new Error(`${book.name} is already downloading`);
        }
        if (this.isBookDeleting(book.id!)) {
            throw new Error(`${book.name} is already deleting`);
        }

        try {
            // 1. start tracking download book            
            //const readersToDownload = book.readers?.filter(r => r.id && !this.isCreatorDownloading(r.id) && !this.isCreatorDownloaded(r.id)) ?? [];
            //const writersToDownload = book.writers?.filter(w => w.id && !this.isCreatorDownloading(w.id) && !this.isCreatorDownloaded(w.id)) ?? [];
            this.downloadingBooks.update(set => [...set, book]);

            // 2. Fetch resources via services (priming the NGSW cache)
            const offlineBook = await firstValueFrom(this.booksService.getById(book.id!).pipe(takeUntil(this.cancelDownloads$)));
            if (book.audioUrl) await firstValueFrom(this.booksService.getAudio(book.id!).pipe(takeUntil(this.cancelDownloads$)));
            if (book.fileUrl) await firstValueFrom(this.booksService.getFile(book.id!).pipe(takeUntil(this.cancelDownloads$)));
            if (book.coverImageUrl) await firstValueFrom(this.booksService.getCover(book.id!, false).pipe(takeUntil(this.cancelDownloads$)));
            if (book.coverImagePreviewUrl) await firstValueFrom(this.booksService.getCover(book.id!, true).pipe(takeUntil(this.cancelDownloads$)));

            // 3. Update signal and localStorage
            this.downloadingBooks.update(set => set.filter(b => b.id !== book.id));
            this.offlineBooks.update(list => {
                const newList = [...list, offlineBook];
                this.saveToStorage('offlineBooks', newList);
                return newList;
            });
        } catch (error: any) {
            this.downloadingBooks.update(set => set.filter(b => b.id !== book.id));
            throw new Error(error);
        }
    }

    async downloadPodcast(podcast: PodcastDto) {
        if (!podcast.id || !podcast.episodes) return;

        if (this.isPodcastDownloaded(podcast.id!)) {
            throw new Error(`${podcast.name} is already Offline`);
        }
        if (this.isPodcastDownloading(podcast.id!)) {
            throw new Error(`${podcast.name} is already downloading`);
        }
        if (this.isPodcastDeleting(podcast.id!)) {
            throw new Error(`${podcast.name} is already deleting`);
        }

        for (const episode of podcast.episodes) {
            if (this.isPodcastEpisodeDownloaded(episode.id!)) continue;
            if (this.isPodcastEpisodeDownloading(episode.id!)) continue;

            episode.podcast = podcast;
            await this.downloadPodcastEpisode(episode);
        }
    }

    async downloadPodcastEpisode(episode: PodcastEpisodeDto) {
        if (!episode.id || !episode.podcast?.id) return;

        if (this.isPodcastEpisodeDownloaded(episode.id!)) {
            throw new Error(`${episode.name} is already Offline`);
        }
        if (this.isPodcastEpisodeDownloading(episode.id!)) {
            throw new Error(`${episode.name} is already downloading`);
        }
        if (this.isPodcastEpisodeDeleting(episode.id!)) {
            throw new Error(`${episode.name} is already deleting`);
        }

        try {
            // 1. Start tracking download episode
            const podcastToDownload = episode.podcast?.id && !this.isPodcastDownloading(episode.podcast.id) && !this.isPodcastDownloaded(episode.podcast.id) ? episode.podcast : null;
            //const voicersToDownload = episode.voicers?.filter(v => v.id && !this.isCreatorDownloading(v.id) && !this.isCreatorDownloaded(v.id)) ?? [];
            this.downloadingEpisodes.update(set => [...set, episode]);

            // 2. Fetch resources via services (priming the NGSW cache)
            const offlineEpisode = await firstValueFrom(this.podcastsService.getEpisodeById(episode.podcast!.id!, episode.id!).pipe(takeUntil(this.cancelDownloads$)));
            if (episode.audioUrl) await firstValueFrom(this.podcastsService.getEpisodeAudio(episode.podcast!.id!, episode.id!).pipe(takeUntil(this.cancelDownloads$)));
            if (episode.coverImageUrl) await firstValueFrom(this.podcastsService.getEpisodeCover(episode.podcast!.id!, episode.id!, false).pipe(takeUntil(this.cancelDownloads$)));
            if (episode.coverImagePreviewUrl) await firstValueFrom(this.podcastsService.getEpisodeCover(episode.podcast!.id!, episode.id!, true).pipe(takeUntil(this.cancelDownloads$)));

            // 3. Download podcast
            if (podcastToDownload) {
                await firstValueFrom(this.podcastsService.getById(podcastToDownload!.id!).pipe(takeUntil(this.cancelDownloads$)));
                if (podcastToDownload.coverImageUrl) await firstValueFrom(this.podcastsService.getCover(podcastToDownload!.id!, true).pipe(takeUntil(this.cancelDownloads$)));
                if (podcastToDownload.coverImagePreviewUrl) await firstValueFrom(this.podcastsService.getCover(podcastToDownload!.id!, false).pipe(takeUntil(this.cancelDownloads$)));
            }

            // 4. Download voicers
            /*if (voicersToDownload?.length > 0) {
                for (const voicer of voicersToDownload) {
                    await firstValueFrom(this.creatorsService.getById(voicer.id!));
                    if (voicer.coverImageUrl) await firstValueFrom(this.creatorsService.getCover(voicer.id!, true));
                    if (voicer.coverImagePreviewUrl) await firstValueFrom(this.creatorsService.getCover(voicer.id!, false));
                }
            }*/

            // 5. Update signal and localStorage
            this.downloadingEpisodes.update(set => set.filter(e => e.id !== episode.id));
            this.offlineEpisodes.update(list => {
                const newList = [...list, offlineEpisode];
                this.saveToStorage('offlinePodcastEpisodes', newList);
                return newList;
            });
        } catch (error: any) {
            this.downloadingEpisodes.update(set => set.filter(e => e.id !== episode.id));
            throw new Error(error);
        }
    }

    async removeBook(id: number) {
        if (!id) return;

        // 1. Find the stored offline version to get the correct URLs (with isOffline=True)
        const storedItem = this.offlineBooks().find(b => b.id === id);
        if (!storedItem) {
            throw new Error(`Book ${id} not found in Offline storage`);
        }
        if (!this.isBookDownloaded(id)) {
            throw new Error(`${storedItem.name} is not Offline`);
        }
        if (this.isBookDownloading(id)) {
            throw new Error(`${storedItem.name} is downloading`);
        }
        if (this.isBookDeleting(id)) {
            throw new Error(`${storedItem.name} is deleting`);
        }

        try {
            // 2. Mark as deleting (for UI feedback)
            this.deletingBooks.update(set => [...set, storedItem]);

            // 3. Determine URLs to remove from cache
            const urlsToRemove = [];
            if (storedItem.dataUrl) urlsToRemove.push(storedItem.dataUrl);
            if (storedItem.audioUrl) urlsToRemove.push(storedItem.audioUrl);
            if (storedItem.fileUrl) urlsToRemove.push(storedItem.fileUrl);
            if (storedItem.coverImageUrl) urlsToRemove.push(storedItem.coverImageUrl);
            if (storedItem.coverImagePreviewUrl) urlsToRemove.push(storedItem.coverImagePreviewUrl);

            // Check if readers are still needed
            /*if (storedItem.readers) {
                for (const reader of storedItem.readers) {
                    if (reader.id && !this.isCreatorDownloaded(reader.id!)) {
                        if (reader.dataUrl) urlsToRemove.push(reader.dataUrl);
                        if (reader.coverImageUrl) urlsToRemove.push(reader.coverImageUrl);
                        if (reader.coverImagePreviewUrl) urlsToRemove.push(reader.coverImagePreviewUrl);
                    }
                }
            }*/

            // 4. Clear from NGSW cache
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                if (name.includes('api-offline-')) {
                    const cache = await caches.open(name);
                    for (const url of urlsToRemove) {
                        const urlWithOfflineTo = this.addOfflineToUrl(url);
                        await cache.delete(urlWithOfflineTo);
                    }
                }
            }

            // 5. Update signal and localStorage (only at the end, after successful cache removal)
            this.deletingBooks.update(set => set.filter(b => b.id !== storedItem.id));
            this.offlineBooks.update(list => {
                const newList = list.filter(b => b.id !== storedItem.id);
                this.saveToStorage('offlineBooks', newList);
                return newList;
            });
        } catch (error: any) {
            this.deletingBooks.update(set => set.filter(b => b.id !== storedItem.id));
            throw new Error(error);
        }
    }

    async removePodcast(id: number) {
        if (!id) return;

        const episodes = this.offlineEpisodes().filter(e => e.podcast?.id === id);
        for (const episode of episodes) {
            if (this.isPodcastEpisodeDownloaded(episode.id!)) {
                await this.removePodcastEpisode(episode.id!);
            }
        }
    }

    async removePodcastEpisode(id: number) {
        if (!id) return;

        // 1. Find the stored offline version to get the correct URLs (with isOffline=True)
        const storedItem = this.offlineEpisodes().find(e => e.id === id);
        if (!storedItem) {
            throw new Error(`Episode ${id} not found in Offline storage`);
        }
        if (!this.isPodcastEpisodeDownloaded(id)) {
            throw new Error(`${storedItem.name} is not Offline`);
        }
        if (this.isPodcastEpisodeDownloading(id)) {
            throw new Error(`${storedItem.name} is downloading`);
        }
        if (this.isPodcastEpisodeDeleting(id)) {
            throw new Error(`${storedItem.name} is already deleting`);
        }

        try {
            // 2. Mark as deleting (for UI feedback)
            this.deletingEpisodes.update(set => [...set, storedItem]);

            // 3. Determine URLs to remove from cache using the storedItem (which has isOffline=True)
            const urlsToRemove: string[] = [];

            if (storedItem.dataUrl) urlsToRemove.push(storedItem.dataUrl);
            if (storedItem.audioUrl) urlsToRemove.push(storedItem.audioUrl);
            if (storedItem.coverImageUrl) urlsToRemove.push(storedItem.coverImageUrl);
            if (storedItem.coverImagePreviewUrl) urlsToRemove.push(storedItem.coverImagePreviewUrl);

            // Check if podcast is still needed
            if (storedItem.podcast?.id && !this.isPodcastDownloaded(storedItem.podcast.id!)) {
                if (storedItem.podcast.dataUrl) urlsToRemove.push(storedItem.podcast?.dataUrl);
                if (storedItem.podcast.coverImageUrl) urlsToRemove.push(storedItem.podcast?.coverImageUrl);
                if (storedItem.podcast.coverImagePreviewUrl) urlsToRemove.push(storedItem.podcast?.coverImagePreviewUrl);
            }

            // Check if voicers are still needed
            /*if (storedItem.voicers) {
                for (const voicer of storedItem.voicers) {
                    if (voicer.id && !this.isCreatorDownloaded(voicer.id!)) {
                        if (voicer.dataUrl) urlsToRemove.push(voicer.dataUrl);
                        if (voicer.coverImageUrl) urlsToRemove.push(voicer.coverImageUrl);
                        if (voicer.coverImagePreviewUrl) urlsToRemove.push(voicer.coverImagePreviewUrl);
                    }
                }
            }*/

            // 4. Clear from NGSW cache
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                if (name.includes('api-offline-')) {
                    const cache = await caches.open(name);
                    for (const url of urlsToRemove) {
                        const urlWithOfflineTo = this.addOfflineToUrl(url);
                        await cache.delete(urlWithOfflineTo);
                    }
                }
            }

            // 5. Update signal and localStorage
            this.deletingEpisodes.update(set => set.filter(e => e.id !== storedItem.id));
            this.offlineEpisodes.update(list => {
                const newList = list.filter(e => e.id !== storedItem.id);
                this.saveToStorage('offlinePodcastEpisodes', newList);
                return newList;
            });
        } catch (error: any) {
            this.deletingEpisodes.update(set => set.filter(e => e.id !== storedItem.id));
            throw new Error(error);
        }
    }
}
