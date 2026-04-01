import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { OfflineService } from '../services/offline.service';
import { AuthService } from '../services/auth.service';
import { catchError, of } from 'rxjs';
import { PagedQuery } from '../models/dtos/pagination/paged-query.model';
import { AudioBookDto } from '../models/dtos/audio-book-dto.model';
import { PodcastDto } from '../models/dtos/podcast-dto.model';
import { CreatorDto } from '../models/dtos/creator-dto.model';

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
    return untracked(() => {
        const authService = inject(AuthService);
        const router = inject(Router);
        const currentUrl = router.currentNavigation()?.extractedUrl.toString() ?? router.url;

        // check only GET requests
        if (req.method !== 'GET') {
            return next(req);
        }

        // skip if not logged in or on edit page
        if (!authService.isLoggedIn() || currentUrl.startsWith('/edit')) {
            return next(req);
        }

        // inject offlineService only if logged in
        const offlineService = inject(OfflineService);
        const reqUrl = req.url;

        // add isOffline=True to the request if offline
        let isOffline = offlineService.isUrlDownloaded(reqUrl) || offlineService.isUrlDownloading(reqUrl);
        let modifiedReq = req;
        if (!req.params.has('isOffline') && isOffline) {
            modifiedReq = req.clone({
                setParams: { isOffline: 'True' }
            });
        }

        return next(modifiedReq).pipe(
            catchError((err) => {
                if (!reqUrl.match(/\/paged/)) throw err;
                if (req.params.get('pageNumber') !== '1') throw err;

                const query: PagedQuery = {
                    pageNumber: 1,
                    pageSize: 1000,
                    search: req.params.get('search')!,
                    sortBy: req.params.get('sortBy')!,
                    sortOrder: req.params.get('sortOrder')! as 'asc' | 'desc'
                };
                let offlineItems: AudioBookDto[] | PodcastDto[] | CreatorDto[] = [];

                // Audiobooks
                if (reqUrl.match(/\/api\/audio-books\/paged/)) {
                    offlineItems = offlineService.audioBooks()
                        .filter(a => a.name.toLowerCase().includes(query.search.toLowerCase()) || a.description?.toLowerCase().includes(query.search.toLowerCase()))
                        .sort((a, b) => {
                            if (query.sortBy === 'name') {
                                return query.sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                            }
                            return 0;
                        });
                }

                // Podcasts
                if (reqUrl.match(/\/api\/podcasts\/paged/)) {
                    offlineItems = offlineService.podcasts()
                        .filter(p => p.name.toLowerCase().includes(query.search.toLowerCase()) || p.description?.toLowerCase().includes(query.search.toLowerCase()))
                        .sort((a, b) => {
                            if (query.sortBy === 'name') {
                                return query.sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                            }
                            return 0;
                        });
                }

                // Creators
                if (reqUrl.match(/\/api\/creators\/paged/)) {
                    offlineItems = offlineService.creators()
                        .filter(c => c.nickname.toLowerCase().includes(query.search.toLowerCase()) || c.name?.toLowerCase().includes(query.search.toLowerCase()) || c.surname?.toLowerCase().includes(query.search.toLowerCase()))
                        .sort((a, b) => {
                            if (query.sortBy === 'name') {
                                return query.sortOrder === 'asc' ? a.nickname.localeCompare(b.nickname) : b.nickname.localeCompare(a.nickname);
                            }
                            return 0;
                        });
                }

                if (offlineItems.length > 0) {
                    return of(new HttpResponse({
                        status: 200,
                        body: {
                            items: offlineItems,
                            totalCount: offlineItems.length,
                            pageNumber: 1,
                            totalPages: 1,
                            hasNextPage: false,
                            hasPreviousPage: false,
                            pagedQuery: query
                        }
                    }));
                }

                throw err;
            })
        );
    });
};
