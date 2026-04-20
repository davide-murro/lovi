import { effect, inject, Injectable, signal, computed } from '@angular/core';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { AudioBookDto } from '../models/dtos/audio-book-dto.model';
import { EBookDto } from '../models/dtos/e-book-dto.model';
import { PodcastEpisodeDto } from '../models/dtos/podcast-episode-dto.model';
import { AudioBooksService } from './audio-books.service';
import { PodcastsService } from './podcasts.service';
import { AuthService } from './auth.service';
import { CreatorsService } from './creators.service';
import { PodcastDto } from '../models/dtos/podcast-dto.model';
import { CreatorDto } from '../models/dtos/creator-dto.model';
import { EBooksService } from './e-books.service';

@Injectable({
    providedIn: 'root'
})
export class OfflineService {
    private authService = inject(AuthService);
    private audioBooksService = inject(AudioBooksService);
    private eBooksService = inject(EBooksService);
    private podcastsService = inject(PodcastsService);
    //private creatorsService = inject(CreatorsService);

    // Track downloaded items with metadata
    private offlineAudioBooks = signal<AudioBookDto[]>([]);
    private offlineEBooks = signal<EBookDto[]>([]);
    private offlineEpisodes = signal<PodcastEpisodeDto[]>([]);

    // Track items being downloaded (priming phase) to allow services to add ?isOffline=true
    private downloadingAudioBooks = signal<AudioBookDto[]>([]);
    private downloadingEBooks = signal<EBookDto[]>([]);
    private downloadingEpisodes = signal<PodcastEpisodeDto[]>([]);

    // Track items being deleted (priming phase)
    private deletingAudioBooks = signal<AudioBookDto[]>([]);
    private deletingEBooks = signal<EBookDto[]>([]);
    private deletingEpisodes = signal<PodcastEpisodeDto[]>([]);

    // Subject to cancel ongoing downloads when user logs out
    private cancelDownloads$ = new Subject<void>();

    audioBooks = computed(() => [...this.downloadingAudioBooks(), ...this.offlineAudioBooks()]);
    eBooks = computed(() => [...this.downloadingEBooks(), ...this.offlineEBooks()]);
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
                    ...this.audioBooks().flatMap(ab => ab.readers ?? []),
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
        this.offlineAudioBooks.set(this.loadFromStorage('offlineAudioBooks'));
        this.offlineEpisodes.set(this.loadFromStorage('offlinePodcastEpisodes'));
        this.offlineEBooks.set(this.loadFromStorage('offlineEBooks'));
        this.downloadingAudioBooks.set([]);
        this.downloadingEpisodes.set([]);
        this.downloadingEBooks.set([]);
        this.deletingAudioBooks.set([]);
        this.deletingEpisodes.set([]);
        this.deletingEBooks.set([]);
    }

    private clearOfflineData() {
        this.cancelDownloads$.next();
        this.offlineAudioBooks.set([]);
        this.offlineEpisodes.set([]);
        this.offlineEBooks.set([]);
        this.downloadingAudioBooks.set([]);
        this.downloadingEpisodes.set([]);
        this.downloadingEBooks.set([]);
        this.deletingAudioBooks.set([]);
        this.deletingEpisodes.set([]);
        this.deletingEBooks.set([]);
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

        if (this.offlineAudioBooks().some(a => {
            if (this.isAudioBookDeleting(a.id!)) return false;
            let found = a.dataUrl === url || a.audioUrl === url || a.coverImageUrl === url || a.coverImagePreviewUrl === url
            if (a.readers) {
                for (const r of a.readers) {
                    found = found || r.dataUrl === url || r.coverImageUrl === url || r.coverImagePreviewUrl === url
                }
            }
            return found;
        })) {
            return true;
        }

        if (this.offlineEBooks().some(b => {
            if (this.isEBookDeleting(b.id!)) return false;
            let found = b.dataUrl === url || b.fileUrl === url || b.coverImageUrl === url || b.coverImagePreviewUrl === url
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

        if (this.downloadingAudioBooks().some(a => {
            let found = a.dataUrl === url || a.audioUrl === url || a.coverImageUrl === url || a.coverImagePreviewUrl === url
            if (a.readers) {
                for (const r of a.readers) {
                    found = found || r.dataUrl === url || r.coverImageUrl === url || r.coverImagePreviewUrl === url
                }
            }
            return found;
        })) {
            return true;
        }

        if (this.downloadingEBooks().some(b => {
            let found = b.dataUrl === url || b.fileUrl === url || b.coverImageUrl === url || b.coverImagePreviewUrl === url
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

        const offlineAudioBooks = this.offlineAudioBooks().filter(a => {
            let found = a.dataUrl === url || a.audioUrl === url || a.coverImageUrl === url || a.coverImagePreviewUrl === url
            if (a.readers) {
                for (const r of a.readers) {
                    found = found || r.dataUrl === url || r.coverImageUrl === url || r.coverImagePreviewUrl === url
                }
            }
            return found;
        });
        if (offlineAudioBooks.length > 0 && offlineAudioBooks.every(a => this.isAudioBookDeleting(a.id!))) {
            return true;
        }

        const offlineEBooks = this.offlineEBooks().filter(b => {
            let found = b.dataUrl === url || b.fileUrl === url || b.coverImageUrl === url || b.coverImagePreviewUrl === url
            if (b.writers) {
                for (const w of b.writers) {
                    found = found || w.dataUrl === url || w.coverImageUrl === url || w.coverImagePreviewUrl === url
                }
            }
            return found;
        });
        if (offlineEBooks.length > 0 && offlineEBooks.every(b => this.isEBookDeleting(b.id!))) {
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

    isAudioBookDownloaded(id: number): boolean {
        if (!id) return false;
        return this.offlineAudioBooks().some(a => a.id === id) && !this.isAudioBookDeleting(id);
    }

    isEBookDownloaded(id: number): boolean {
        if (!id) return false;
        return this.offlineEBooks().some(a => a.id === id) && !this.isEBookDeleting(id);
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
        // A creator is "offline" if they are part of any offline audiobook or episode
        return (this.offlineAudioBooks().some(a => a.readers?.some(r => r.id === id)) ||
            this.offlineEBooks().some(e => e.writers?.some(w => w.id === id)) ||
            this.offlineEpisodes().some(e => e.voicers?.some(v => v.id === id))) &&
            !this.isCreatorDeleting(id);
    }

    isAudioBookDownloading(id: number): boolean {
        if (!id) return false;
        return this.downloadingAudioBooks().some(a => a.id === id);
    }

    isEBookDownloading(id: number): boolean {
        if (!id) return false;
        return this.downloadingEBooks().some(a => a.id === id);
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
            this.downloadingAudioBooks().some(a => a.readers?.some(r => r.id === id)) ||
            this.downloadingEBooks().some(e => e.writers?.some(w => w.id === id));
    }

    isAudioBookDeleting(id: number): boolean {
        if (!id) return false;
        return this.deletingAudioBooks().some(a => a.id === id);
    }

    isEBookDeleting(id: number): boolean {
        if (!id) return false;
        return this.deletingEBooks().some(a => a.id === id);
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
        const offlineAudioBooks = this.offlineAudioBooks().filter(a => a.readers?.some(r => r.id === id));
        const offlineEBooks = this.offlineEBooks().filter(e => e.writers?.some(w => w.id === id));
        return offlinePodcastEpisodes.length > 0 && offlinePodcastEpisodes.every(e => this.isPodcastEpisodeDeleting(e.id!)) ||
            offlineAudioBooks.length > 0 && offlineAudioBooks.every(a => this.isAudioBookDeleting(a.id!)) ||
            offlineEBooks.length > 0 && offlineEBooks.every(e => this.isEBookDeleting(e.id!));
    }

    async downloadAudioBook(audioBook: AudioBookDto) {
        if (!audioBook.id) return;

        if (this.isAudioBookDownloaded(audioBook.id!)) {
            throw new Error(`${audioBook.name} is already Offline`);
        }
        if (this.isAudioBookDownloading(audioBook.id!)) {
            throw new Error(`${audioBook.name} is already downloading`);
        }
        if (this.isAudioBookDeleting(audioBook.id!)) {
            throw new Error(`${audioBook.name} is already deleting`);
        }

        try {
            // 1. start tracking download audio book
            const readersToDownload = audioBook.readers?.filter(r => r.id && !this.isCreatorDownloading(r.id) && !this.isCreatorDownloaded(r.id)) ?? [];
            this.downloadingAudioBooks.update(set => [...set, audioBook]);

            // 2. Fetch resources via services (priming the NGSW cache)
            const offlineAudioBook = await firstValueFrom(this.audioBooksService.getById(audioBook.id!).pipe(takeUntil(this.cancelDownloads$)));
            if (audioBook.audioUrl) await firstValueFrom(this.audioBooksService.getAudio(audioBook.id!).pipe(takeUntil(this.cancelDownloads$)));
            if (audioBook.coverImageUrl) await firstValueFrom(this.audioBooksService.getCover(audioBook.id!, false).pipe(takeUntil(this.cancelDownloads$)));
            if (audioBook.coverImagePreviewUrl) await firstValueFrom(this.audioBooksService.getCover(audioBook.id!, true).pipe(takeUntil(this.cancelDownloads$)));

            // 3. Download readers
            /*if (readersToDownload?.length > 0) {
                for (const reader of readersToDownload) {
                    await firstValueFrom(this.creatorsService.getById(reader.id!));
                    if (reader.coverImageUrl) await firstValueFrom(this.creatorsService.getCover(reader.id!, true));
                    if (reader.coverImagePreviewUrl) await firstValueFrom(this.creatorsService.getCover(reader.id!, false));
                }
            }*/

            // 4. Update signal and localStorage
            this.downloadingAudioBooks.update(set => set.filter(a => a.id !== audioBook.id));
            this.offlineAudioBooks.update(list => {
                const newList = [...list, offlineAudioBook];
                this.saveToStorage('offlineAudioBooks', newList);
                return newList;
            });
        } catch (error: any) {
            this.downloadingAudioBooks.update(set => set.filter(a => a.id !== audioBook.id));
            throw new Error(error);
        }
    }

    async downloadEBook(eBook: EBookDto) {
        if (!eBook.id) return;

        if (this.isEBookDownloaded(eBook.id!)) {
            throw new Error(`${eBook.name} is already Offline`);
        }
        if (this.isEBookDownloading(eBook.id!)) {
            throw new Error(`${eBook.name} is already downloading`);
        }
        if (this.isEBookDeleting(eBook.id!)) {
            throw new Error(`${eBook.name} is already deleting`);
        }

        try {
            // 1. track download
            this.downloadingEBooks.update(set => [...set, eBook]);

            // 2. Priming cache
            const offlineEBook = await firstValueFrom(this.eBooksService.getById(eBook.id!).pipe(takeUntil(this.cancelDownloads$)));
            if (eBook.fileUrl) await firstValueFrom(this.eBooksService.getFile(eBook.id!).pipe(takeUntil(this.cancelDownloads$)));
            if (eBook.coverImageUrl) await firstValueFrom(this.eBooksService.getCover(eBook.id!, false).pipe(takeUntil(this.cancelDownloads$)));
            if (eBook.coverImagePreviewUrl) await firstValueFrom(this.eBooksService.getCover(eBook.id!, true).pipe(takeUntil(this.cancelDownloads$)));

            // 3. Download writers
            /*if (writersToDownload?.length > 0) {
                for (const writer of writersToDownload) {
                    await firstValueFrom(this.creatorsService.getById(writer.id!));
                    if (writer.coverImageUrl) await firstValueFrom(this.creatorsService.getCover(writer.id!, true));
                    if (writer.coverImagePreviewUrl) await firstValueFrom(this.creatorsService.getCover(writer.id!, false));
                }
            }*/

            // 4. Update signal and storage
            this.downloadingEBooks.update(set => set.filter(a => a.id !== eBook.id));
            this.offlineEBooks.update(list => {
                const newList = [...list, offlineEBook];
                this.saveToStorage('offlineEBooks', newList);
                return newList;
            });
        } catch (error: any) {
            this.downloadingEBooks.update(set => set.filter(a => a.id !== eBook.id));
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
            const voicersToDownload = episode.voicers?.filter(v => v.id && !this.isCreatorDownloading(v.id) && !this.isCreatorDownloaded(v.id)) ?? [];
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

    async removeAudioBook(id: number) {
        if (!id) return;

        // 1. Find the stored offline version to get the correct URLs (with isOffline=True)
        const storedItem = this.offlineAudioBooks().find(a => a.id === id);
        if (!storedItem) {
            throw new Error(`Audiobook ${id} not found in Offline storage`);
        }
        if (!this.isAudioBookDownloaded(id)) {
            throw new Error(`${storedItem.name} is not Offline`);
        }
        if (this.isAudioBookDownloading(id)) {
            throw new Error(`${storedItem.name} is downloading`);
        }
        if (this.isAudioBookDeleting(id)) {
            throw new Error(`${storedItem.name} is deleting`);
        }

        try {
            // 2. Mark as deleting (for UI feedback)
            this.deletingAudioBooks.update(set => [...set, storedItem]);

            // 3. Determine URLs to remove from cache
            const urlsToRemove = [];
            if (storedItem.dataUrl) urlsToRemove.push(storedItem.dataUrl);
            if (storedItem.audioUrl) urlsToRemove.push(storedItem.audioUrl);
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
            this.deletingAudioBooks.update(set => set.filter(a => a.id !== storedItem.id));
            this.offlineAudioBooks.update(list => {
                const newList = list.filter(a => a.id !== storedItem.id);
                this.saveToStorage('offlineAudioBooks', newList);
                return newList;
            });
        } catch (error: any) {
            this.deletingAudioBooks.update(set => set.filter(a => a.id !== storedItem.id));
            throw new Error(error);
        }
    }

    async removeEBook(id: number) {
        if (!id) return;

        const storedItem = this.offlineEBooks().find(a => a.id === id);
        if (!storedItem) return;

        try {
            this.deletingEBooks.update(set => [...set, storedItem]);

            const urlsToRemove = [];
            if (storedItem.dataUrl) urlsToRemove.push(storedItem.dataUrl);
            if (storedItem.fileUrl) urlsToRemove.push(storedItem.fileUrl);
            if (storedItem.coverImageUrl) urlsToRemove.push(storedItem.coverImageUrl);
            if (storedItem.coverImagePreviewUrl) urlsToRemove.push(storedItem.coverImagePreviewUrl);

            // Check if writers are still needed
            /*if (storedItem.writers) {
                for (const writer of storedItem.writers) {
                    if (writer.id && !this.isCreatorDownloaded(writer.id!)) {
                        if (writer.dataUrl) urlsToRemove.push(writer.dataUrl);
                        if (writer.coverImageUrl) urlsToRemove.push(writer.coverImageUrl);
                        if (writer.coverImagePreviewUrl) urlsToRemove.push(writer.coverImagePreviewUrl);
                    }
                }
            }*/

            // Clear from NGSW cache
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

            this.deletingEBooks.update(set => set.filter(a => a.id !== storedItem.id));
            this.offlineEBooks.update(list => {
                const newList = list.filter(a => a.id !== storedItem.id);
                this.saveToStorage('offlineEBooks', newList);
                return newList;
            });
        } catch (error: any) {
            this.deletingEBooks.update(set => set.filter(a => a.id !== storedItem.id));
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
