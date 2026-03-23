import { InjectionToken } from '@angular/core';
import { FetchInterceptorFn } from './fetch-interceptor.type';

export const FETCH_INTERCEPTORS = new InjectionToken<FetchInterceptorFn[]>(
    'FETCH_INTERCEPTORS'
);