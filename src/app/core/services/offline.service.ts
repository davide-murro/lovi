import { effect, inject, Injectable, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AudioBookDto } from '../models/dtos/audio-book-dto.model';
import { PodcastEpisodeDto } from '../models/dtos/podcast-episode-dto.model';
import { AudioBooksService } from './audio-books.service';
import { PodcastsService } from './podcasts.service';
import { AuthService } from './auth.service';
import { CreatorsService } from './creators.service';

@Injectable({
    providedIn: 'root'
})
export class OfflineService {
    private authService = inject(AuthService);
    private audioBooksService = inject(AudioBooksService);
    private podcastsService = inject(PodcastsService);
    private creatorsService = inject(CreatorsService);

    // Track downloaded items with metadata
    private offlineAudioBooks = signal<AudioBookDto[]>([]);
    private offlineEpisodes = signal<PodcastEpisodeDto[]>([]);

    // Track items being downloaded (priming phase) to allow services to add ?isOffline=true
    private downloadingAudioBooks = signal<AudioBookDto[]>([]);
    private downloadingEpisodes = signal<PodcastEpisodeDto[]>([]);

    // Track items being deleted (priming phase)
    private deletingAudioBooks = signal<AudioBookDto[]>([]);
    private deletingEpisodes = signal<PodcastEpisodeDto[]>([]);

    audioBooks = computed(() => [...this.downloadingAudioBooks(), ...this.offlineAudioBooks()]);
    episodes = computed(() => [...this.downloadingEpisodes(), ...this.offlineEpisodes()]);

    constructor() {
        console.log("OfflineService constructor")
        // TODO: check when is called.. and if it necessary also for playing audio in smartphone, and also request per leggere audio locali
        this.requestPersistentStorage();

        effect(() => {
            if (this.authService.isLoggedIn()) this.initializeOfflineData();
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
        this.offlineAudioBooks.set(this.loadFromStorage('offlineAudioBooks'));
        this.offlineEpisodes.set(this.loadFromStorage('offlinePodcastEpisodes'));
    }

    private clearOfflineData() {
        this.offlineAudioBooks.set([]);
        this.offlineEpisodes.set([]);
    }

    private loadFromStorage(key: string): any[] {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
            return [];
        }
    }

    private saveToStorage(key: string, data: any[]) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    private addOfflineToUrl(url: string) {
        if (!url) return url;
        if (url.includes('isOffline=')) return url;
        return url.includes('?') ? `${url}&isOffline=True` : `${url}?isOffline=True`;
    }

    isUrlDownloaded(url: string): boolean {
        if (!url) return false;

        let isOffline = false;

        // Audiobooks
        const audioBookMatch = url.match(/\/api\/audio-books\/(\d+)/);
        if (audioBookMatch) {
            const id = parseInt(audioBookMatch[1]);
            isOffline = this.isAudioBookDownloaded(id);
        }

        // Podcasts & Episodes
        const podcastMatch = url.match(/\/api\/podcasts\/(\d+)/);
        if (podcastMatch) {
            const podcastId = parseInt(podcastMatch[1]);
            const episodeMatch = url.match(/\/episodes\/(\d+)/);

            if (episodeMatch) {
                const episodeId = parseInt(episodeMatch[1]);
                isOffline = this.isPodcastEpisodeDownloaded(episodeId);
            } else {
                isOffline = this.isPodcastDownloaded(podcastId);
            }
        }

        // Creators
        const creatorMatch = url.match(/\/api\/creators\/(\d+)/);
        if (creatorMatch) {
            const id = parseInt(creatorMatch[1]);
            isOffline = this.isCreatorDownloaded(id);
        }

        return isOffline;
    }

    isUrlDownloading(url: string): boolean {
        if (!url) return false;

        let isDownloading = false;

        // Audiobooks
        const audioBookMatch = url.match(/\/api\/audio-books\/(\d+)/);
        if (audioBookMatch) {
            const id = parseInt(audioBookMatch[1]);
            isDownloading = this.isAudioBookDownloading(id);
        }

        // Podcasts & Episodes
        const podcastMatch = url.match(/\/api\/podcasts\/(\d+)/);
        if (podcastMatch) {
            const podcastId = parseInt(podcastMatch[1]);
            const episodeMatch = url.match(/\/episodes\/(\d+)/);

            if (episodeMatch) {
                console.log("fdsfdsfsd")
                const episodeId = parseInt(episodeMatch[1]);
                isDownloading = this.isPodcastEpisodeDownloading(episodeId);
            } else {
                isDownloading = this.isPodcastDownloading(podcastId);
            }
        }

        // Creators
        const creatorMatch = url.match(/\/api\/creators\/(\d+)/);
        if (creatorMatch) {
            const id = parseInt(creatorMatch[1]);
            isDownloading = this.isCreatorDownloading(id);
        }

        return isDownloading;
    }

    isAudioBookDownloaded(id: number): boolean {
        if (!id) return false;
        return this.offlineAudioBooks().some(a => a.id === id) &&
            !this.downloadingAudioBooks().some(a => a.id === id) &&
            !this.deletingAudioBooks().some(a => a.id === id);
    }

    isPodcastEpisodeDownloaded(id: number): boolean {
        if (!id) return false;
        return this.offlineEpisodes().some(e => e.id === id) &&
            !this.downloadingEpisodes().some(e => e.id === id) &&
            !this.deletingEpisodes().some(e => e.id === id);
    }

    isPodcastDownloaded(id: number): boolean {
        if (!id) return false;
        // A podcast is "offline" if any of its episodes are offline or being downloaded
        return this.offlineEpisodes().some(e => e.podcast?.id === id) &&
            !this.isPodcastDownloading(id) &&
            !this.isPodcastDeleting(id);
    }

    isCreatorDownloaded(id: number): boolean {
        if (!id) return false;
        // A creator is "offline" if they are part of any offline audiobook or episode
        return (this.offlineAudioBooks().some(a => a.readers?.some(r => r.id === id)) || this.offlineEpisodes().some(e => e.voicers?.some(v => v.id === id))) &&
            !this.isCreatorDownloading(id) &&
            !this.isCreatorDeleting(id);
    }

    isAudioBookDownloading(id: number): boolean {
        if (!id) return false;
        return this.downloadingAudioBooks().some(a => a.id === id);
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
            this.downloadingAudioBooks().some(a => a.readers?.some(r => r.id === id));
    }

    isAudioBookDeleting(id: number): boolean {
        if (!id) return false;
        return this.deletingAudioBooks().some(a => a.id === id);
    }

    isPodcastEpisodeDeleting(id: number): boolean {
        if (!id) return false;
        return this.deletingEpisodes().some(e => e.id === id);
    }

    isPodcastDeleting(id: number): boolean {
        if (!id) return false;
        return this.offlineEpisodes().filter(e => e.podcast?.id === id).every(e => this.isPodcastEpisodeDeleting(e.id!));
    }

    isCreatorDeleting(id: number): boolean {
        if (!id) return false;
        return this.offlineEpisodes().filter(e => e.voicers?.some(v => v.id === id)).every(e => this.isPodcastEpisodeDeleting(e.id!)) ||
            this.offlineAudioBooks().filter(a => a.readers?.some(r => r.id === id)).every(a => this.isAudioBookDeleting(a.id!));
    }

    async downloadAudioBook(audioBook: AudioBookDto) {
        if (!audioBook.id || !audioBook.audioUrl) return;

        if (this.isAudioBookDownloaded(audioBook.id!)) {
            throw new Error(`${audioBook.name} is already offline`);
        }
        if (this.isAudioBookDownloading(audioBook.id!)) {
            throw new Error(`${audioBook.name} is already downloading`);
        }

        try {
            // 1. start tracking download audio book
            const readersToDownload = audioBook.readers?.filter(r => r.id && !this.isCreatorDownloading(r.id) && !this.isCreatorDownloaded(r.id)) ?? [];
            this.downloadingAudioBooks.update(set => [...set, audioBook]);

            // 2. Fetch resources via services (priming the NGSW cache)
            const offlineAudioBook = await firstValueFrom(this.audioBooksService.getById(audioBook.id!));
            if (audioBook.audioUrl) await firstValueFrom(this.audioBooksService.getAudio(audioBook.id!));
            if (audioBook.coverImageUrl) await firstValueFrom(this.audioBooksService.getCover(audioBook.id!, false));
            if (audioBook.coverImagePreviewUrl) await firstValueFrom(this.audioBooksService.getCover(audioBook.id!, true));

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

    async downloadPodcastEpisode(episode: PodcastEpisodeDto) {
        if (!episode.id || !episode.audioUrl || !episode.podcast) return;

        if (this.isPodcastEpisodeDownloaded(episode.id!)) {
            throw new Error(`${episode.name} is already offline`);
        }
        if (this.isPodcastEpisodeDownloading(episode.id!)) {
            throw new Error(`${episode.name} is already downloading`);
        }

        try {
            // 1. Start tracking download episode
            const podcastToDownload = episode.podcast?.id && !this.isPodcastDownloading(episode.podcast.id) && !this.isPodcastDownloaded(episode.podcast.id) ? episode.podcast : null;
            const voicersToDownload = episode.voicers?.filter(v => v.id && !this.isCreatorDownloading(v.id) && !this.isCreatorDownloaded(v.id)) ?? [];
            this.downloadingEpisodes.update(set => [...set, episode]);

            // 2. Fetch resources via services (priming the NGSW cache)
            // TODO: download with fetch urls instead
            const offlineEpisode = await firstValueFrom(this.podcastsService.getEpisodeById(episode.podcast!.id!, episode.id!));
            if (episode.audioUrl) await firstValueFrom(this.podcastsService.getEpisodeAudio(episode.podcast!.id!, episode.id!));
            if (episode.coverImageUrl) await firstValueFrom(this.podcastsService.getEpisodeCover(episode.podcast!.id!, episode.id!, false));
            if (episode.coverImagePreviewUrl) await firstValueFrom(this.podcastsService.getEpisodeCover(episode.podcast!.id!, episode.id!, true));

            // 3. Download podcast
            if (podcastToDownload) {
                await firstValueFrom(this.podcastsService.getById(podcastToDownload!.id!));
                if (podcastToDownload.coverImageUrl) await firstValueFrom(this.podcastsService.getCover(podcastToDownload!.id!, true));
                if (podcastToDownload.coverImagePreviewUrl) await firstValueFrom(this.podcastsService.getCover(podcastToDownload!.id!, false));
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
            throw new Error(`Audiobook ${id} not found in offline storage`);
        }
        if (!this.isAudioBookDownloaded(id)) {
            throw new Error(`${storedItem.name} is not offline`);
        }
        if (this.isAudioBookDownloading(id)) {
            throw new Error(`${storedItem.name} is downloading`);
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

            // Check if readers' covers are still needed
            if (storedItem.readers) {
                for (const reader of storedItem.readers) {
                    if (reader.id && !this.isCreatorDownloaded(reader.id!)) {
                        if (reader.dataUrl) urlsToRemove.push(reader.dataUrl);
                        if (reader.coverImageUrl) urlsToRemove.push(reader.coverImageUrl);
                        if (reader.coverImagePreviewUrl) urlsToRemove.push(reader.coverImagePreviewUrl);
                    }
                }
            }

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

    async removePodcastEpisode(id: number) {
        if (!id) return;

        // 1. Find the stored offline version to get the correct URLs (with isOffline=True)
        const storedItem = this.offlineEpisodes().find(e => e.id === id);
        if (!storedItem) {
            throw new Error(`Episode ${id} not found in offline storage`);
        }
        if (!this.isPodcastEpisodeDownloaded(id)) {
            throw new Error(`${storedItem.name} is not offline`);
        }
        if (this.isPodcastEpisodeDownloading(id)) {
            throw new Error(`${storedItem.name} is downloading`);
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

            // Check if podcast cover is still needed
            if (storedItem.podcast?.id && !this.isPodcastDownloaded(storedItem.podcast.id!)) {
                if (storedItem.podcast.dataUrl) urlsToRemove.push(storedItem.podcast?.dataUrl);
                if (storedItem.podcast.coverImageUrl) urlsToRemove.push(storedItem.podcast?.coverImageUrl);
                if (storedItem.podcast.coverImagePreviewUrl) urlsToRemove.push(storedItem.podcast?.coverImagePreviewUrl);
            }

            // Check if voicers' covers are still needed
            if (storedItem.voicers) {
                for (const voicer of storedItem.voicers) {
                    if (voicer.id && !this.isCreatorDownloaded(voicer.id!)) {
                        if (voicer.dataUrl) urlsToRemove.push(voicer.dataUrl);
                        if (voicer.coverImageUrl) urlsToRemove.push(voicer.coverImageUrl);
                        if (voicer.coverImagePreviewUrl) urlsToRemove.push(voicer.coverImagePreviewUrl);
                    }
                }
            }

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
