import { Provider } from '@angular/core';
import { FETCH_INTERCEPTORS } from './fetch-interceptor.token';
import { FetchInterceptorFn } from './fetch-interceptor.type';
import { FetchClient } from './fetch-client.service';

export function provideFetchClient(
    ...interceptors: FetchInterceptorFn[]
): Provider[] {
    return [
        FetchClient,
        ...interceptors.map((interceptor) => ({
            provide: FETCH_INTERCEPTORS,
            useValue: interceptor,
            multi: true
        }))
    ];
}