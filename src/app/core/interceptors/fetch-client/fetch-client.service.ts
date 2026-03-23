import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import { FETCH_INTERCEPTORS } from './fetch-interceptor.token';
import { FetchInterceptorFn } from './fetch-interceptor.type';

@Injectable({ providedIn: 'root' })
export class FetchClient {
  private interceptors = inject(FETCH_INTERCEPTORS, { optional: true }) ?? [];

  private injector = inject(EnvironmentInjector);

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const initialInit: RequestInit = {
      ...options,
      headers: {
        ...new Headers(),
        ...options.headers,
      }
    };

    const chain = this.buildChain(this.interceptors);

    // THIS is what fixes NG0203
    return runInInjectionContext(this.injector, () =>
      chain(url, initialInit)
    );
  }

  private buildChain(
    interceptors: FetchInterceptorFn[]
  ): (url: string, init: RequestInit) => Promise<Response> {

    let handler = (url: string, init: RequestInit) => fetch(url, init);

    // Wrap interceptors from right to left
    for (let i = interceptors.length - 1; i >= 0; i--) {
      const interceptor = interceptors[i];
      const next = handler;

      handler = (url: string, init: RequestInit) =>
        interceptor(url, init, next);
    }

    return handler;
  }

  // helpers
  get(url: string, init?: RequestInit) {
    return this.request(url, { ...init, method: 'GET' });
  }

  post(url: string, body: any, init?: RequestInit) {
    return this.request(url, {
      ...init,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      }
    });
  }
}