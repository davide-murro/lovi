export type FetchInterceptorFn = (
    url: string,
    init: RequestInit,
    next: (url: string, init: RequestInit) => Promise<Response>
) => Promise<Response>;