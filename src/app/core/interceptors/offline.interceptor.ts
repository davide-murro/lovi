import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OfflineService } from '../services/offline.service';
import { AuthService } from '../services/auth.service';

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    if (!authService.isLoggedIn()) {
        return next(req);
    }

    // inject offlineService only if logged in
    const offlineService = inject(OfflineService);
    const url = req.url;

    // add isOffline=True to the request if offline
    let modifiedReq = req;
    if (!req.params.has('isOffline') && (offlineService.isUrlDownloaded(url)) || offlineService.isUrlDownloading(url)) {
        modifiedReq = req.clone({
            setParams: { isOffline: 'True' }
        });
    }

    return next(modifiedReq);
};
