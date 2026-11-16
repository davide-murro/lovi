# Repository Guidelines

## Structure

LOVI is an Angular application. Bootstrap is in `src/main.ts`; routing and providers are in `src/app/app.routes.ts` and `app.config.ts`. Screens live in `src/app/pages/`, reusable UI in `src/app/shared/`, and cross-cutting services, models, and utilities in `src/app/core/`. Keep component TypeScript, HTML, SCSS, and `*.spec.ts` files together. Global styles are in `src/styles.scss`; assets are in `public/`; translations are in `src/locale/`.

## Libraries and Implementation Patterns

- Prefer Angular `signal` for writable reactive state, `computed` for derived values, and `effect` for side effects. Follow the app's zoneless setup.
- Tailwind CSS v4 is imported in `src/styles.scss`. Use utility classes; extend the shared theme/styles there for repeated patterns.
- Use Font Awesome via `@fortawesome/angular-fontawesome`; import needed solid/brand icons and render with `<fa-icon>`.
- EPUB reading uses `@asteasolutions/epub-reader`, wrapped in `src/app/shared/epub-reader/` and coordinated by `EBookReaderService`. `istanbul-lib-instrument` is for JavaScript coverage instrumentation, not EPUB reading.
- Keep API/business logic in core services. Follow nearby patterns for standalone components, dependency injection, RxJS, and templates.

## Localization

Use Angular i18n (`$localize` in TypeScript, `i18n` in templates) for user-facing text. Source XLIFF is `src/locale/messages.xlf`; Italian and Finnish catalogs are `messages.it.xlf` and `messages.fi.xlf`. After changing marked text, run `npm run extract-i18n` and update translated entries. Keep translation units in the same order and indentation in every locale XLIFF file, matching the source catalog. Locale builds are configured in `angular.json`.

## Offline Support and PWA

Angular's service worker is enabled for production through `app.config.ts` and `ngsw-config.json`; development disables it in `src/environments/environment.ts`. The manifest and icons are in `public/`. The worker precaches the app shell, lazily caches assets, and caches configured offline API responses for books, episodes, and covers (`isOffline=True`). `OfflineService` downloads selected content and tracks metadata in browser storage. The offline interceptor marks saved requests and can return saved paged catalogs after network errors. Keep these layers aligned when changing offline behavior; not every API response is cached.

## Environments

There are three environment files: `environment.ts` is the base/local fallback, `environment.development.ts` is selected by the Angular development build, and `environment.production.ts` is selected by production builds. `npm start` uses the development replacement; `npm run build` uses production by default. Keep the objects structurally aligned when adding settings such as `apiUrl` or OAuth client IDs. Use placeholders for local-only credentials and never put secrets in frontend environment files: bundled values are public. Service-worker enablement and API endpoints differ by environment; use the intended build configuration instead of editing values ad hoc.

## Toasts, Dialogs, and Pagination

Inject `ToasterService` for brief feedback: `toasterService.show($localize\`Saved\`, { type: 'success' })`. Supported types are `success`, `error`, `info`, and `warning`; duration is milliseconds. Use `DialogService.confirm(title, message)` for a yes/no decision and act on its emitted boolean. Use `open(Component, { title, data, type })` for a purpose-built dialog; pass data through component inputs and close it via `DialogService.close(result)`. Use `log()` for informational details. Prefer dialogs for decisions or detailed content and toasts for completed actions/errors; localize user-facing text.

`PagedQuery` and `PagedResult<T>` define the API paging contract. Use `BooksPaged`/`PodcastsPaged`-style components for catalog cards and `*TablePaged` components for admin tables. They bind the query to signals, call the corresponding core service, and use the shared `Pagination` component. Preserve query parameters (`pageNumber`, `pageSize`, `sortBy`, `sortOrder`, `search`); `controlRoute` determines whether changes update the URL or only component state. For a new data type, follow the closest existing paged component and service pattern rather than duplicating pagination logic.

## Authentication and Authorization

`AuthService` owns session, access-token, and role state. `authInterceptor` attaches the bearer token when available plus device and locale headers; on an authenticated 401 it attempts token refresh and retries, while an invalid refresh session logs out and redirects to login. Keep auth HTTP calls aligned with the existing cookie/`ngsw-bypass` behavior. `authGuard` protects routes and checks optional `data.roles` (for example, `['Admin', 'Editor']`); `AuthDirective` conditionally shows UI by login state/role. Use both route guards and UI directives where appropriate, but treat them as client-side navigation/display controls: the API must enforce authorization independently.

## Commands, Style, and Tests

Commands: `npm install` installs locked dependencies; `npm start` serves locally; `npm run build` makes the default production build; `npm run build-production` sets deployment base `/browser/`; `npm test` runs Angular CLI/Vitest tests; `npm run extract-i18n` extracts messages. Tests sit beside code as `*.spec.ts` and use `TestBed` and `describe`/`it`/`expect`. Test behavior changes and build app/template changes. No coverage threshold or lint script is configured.

Follow `.editorconfig` (UTF-8, two spaces, final newline); TypeScript uses single quotes and the `package.json` Prettier settings use a 100-character width. Use kebab-case filenames (for example, `user-profile.ts`) and the `app` selector prefix. Keep strict TypeScript and template checks enabled.

## Commits and Configuration

Recent commits use short, lowercase summaries (for example, `dialog graphic change`); keep commits focused. PRs should summarize behavior, link issues when applicable, include screenshots for visual changes, and list checks run. Environment configuration is in `src/environments/`; never add secrets. Update and review `package.json` and `package-lock.json` together.
