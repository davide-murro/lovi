import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OfflineService } from '../services/offline.service';
import { AuthService } from '../services/auth.service';

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    if (!authService.isLoggedIn()) {
        return next(req);
    }

    const offlineService = inject(OfflineService);
    const url = req.url;

    // 1. Identify resource type and ID from URL
    let isOffline = false;

    // Audiobooks
    const audioBookMatch = url.match(/\/api\/audio-books\/(\d+)/);
    if (audioBookMatch) {
        const id = parseInt(audioBookMatch[1]);
        isOffline = offlineService.isAudioBookDownloaded(id) || offlineService.isAudioBookDownloading(id);
    }

    // Podcasts & Episodes
    const podcastMatch = url.match(/\/api\/podcasts\/(\d+)/);
    if (podcastMatch) {
        const podcastId = parseInt(podcastMatch[1]);
        const episodeMatch = url.match(/\/episodes\/(\d+)/);

        if (episodeMatch) {
            const episodeId = parseInt(episodeMatch[1]);
            isOffline = offlineService.isPodcastEpisodeDownloaded(episodeId) || offlineService.isPodcastEpisodeDownloading(episodeId);
        } else {
            isOffline = offlineService.isPodcastDownloaded(podcastId) || offlineService.isPodcastDownloading(podcastId);
        }
    }

    // Creators
    const creatorMatch = url.match(/\/api\/creators\/(\d+)/);
    if (creatorMatch) {
        const id = parseInt(creatorMatch[1]);
        isOffline = offlineService.isCreatorDownloaded(id) || offlineService.isCreatorDownloading(id);
    }

    // 2. Add isOffline=True to the request if offline
    let modifiedReq = req;
    if (isOffline && !req.params.has('isOffline')) {
        modifiedReq = req.clone({
            setParams: { isOffline: 'True' }
        });
    }

    // 3. Map response URLs if offline & handle error purging
    return next(modifiedReq);
};
