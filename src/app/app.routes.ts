import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { bookResolver } from "./core/resolvers/book.resolver";
import { creatorResolver } from "./core/resolvers/creator.resolver";
import { podcastEpisodeResolver } from "./core/resolvers/podcast-episode.resolver";
import { podcastResolver } from "./core/resolvers/podcast.resolver";
import { roleResolver } from "./core/resolvers/role.resolver";
import { userProfileResolver } from "./core/resolvers/user-profile.resolver";
import { userResolver } from "./core/resolvers/user.resolver";
import { Home } from "./pages/home/home";


import { UserProfile } from './pages/user-profile/user-profile';
import { Books } from './pages/books/books';
import { BookDetails } from './pages/books/book-details/book-details';
import { Podcasts } from './pages/podcasts/podcasts';
import { PodcastDetails } from './pages/podcasts/podcast-details/podcast-details';
import { PodcastEpisodeDetails } from './pages/podcasts/podcast-details/podcast-episode-details/podcast-episode-details';
import { MyLibraryContainer } from './pages/my-library-container/my-library-container';
import { MyLibrary } from './pages/my-library-container/my-library/my-library';
import { MyOffline } from './pages/my-library-container/my-offline/my-offline';
import { Search } from './pages/search/search';
import { AboutUs } from './pages/about-us/about-us';
import { NotFound } from './shared/not-found/not-found';
import { Forbidden } from './shared/forbidden/forbidden';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        title: $localize`LOVI - Home Page`
    },
    {
        path: 'auth/login',
        loadComponent: () => import('./pages/auth/login/login').then(m => m.Login),
        title: $localize`LOVI - Log In`
    },
    {
        path: 'auth/register',
        loadComponent: () => import('./pages/auth/register/register').then(m => m.Register),
        title: $localize`LOVI - Register`
    },
    {
        path: 'auth/confirm-email',
        loadComponent: () => import('./pages/auth/confirm-email/confirm-email').then(m => m.ConfirmEmail),
        title: $localize`LOVI - Confirm Email`
    },
    {
        path: 'auth/forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(m => m.ForgotPassword),
        title: $localize`LOVI - Forgot Password`
    },
    {
        path: 'auth/confirm-change-email',
        loadComponent: () => import('./pages/auth/confirm-change-email/confirm-change-email').then(m => m.ConfirmChangeEmail),
        title: $localize`LOVI - Confirm Change Email`
    },
    {
        path: 'user-profile',
        component: UserProfile,
        title: $localize`LOVI - User Profile`,
        canActivate: [authGuard],
        resolve: {
            userProfile: userProfileResolver
        },
    },
    {
        path: 'books',
        component: Books,
        title: $localize`LOVI - Books`
    },
    {
        path: 'books/:id',
        component: BookDetails,
        title: $localize`LOVI - Book Details`,
        resolve: {
            book: bookResolver
        },
    },
    {
        path: 'podcasts',
        component: Podcasts,
        title: $localize`LOVI - Podcasts`
    },
    {
        path: 'podcasts/:id',
        title: $localize`LOVI - Podcast Details`,
        resolve: {
            podcast: podcastResolver // Resolver runs before 'podcasts/:id' component loads
        },
        children: [
            {
                path: '',
                component: PodcastDetails,
            },
            {
                path: 'episodes/:episodeId',
                component: PodcastEpisodeDetails,
                title: $localize`LOVI - Podcast Episode Details`,
                resolve: {
                    podcastEpisode: podcastEpisodeResolver
                },
            }
        ]
    },
    {
        path: 'my-library',
        component: MyLibraryContainer,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'library',
                pathMatch: 'full'
            },
            {
                path: 'library',
                component: MyLibrary,
                title: $localize`LOVI - My Library`
            },
            {
                path: 'offline',
                component: MyOffline,
                title: $localize`LOVI - My Offline`
            }/*,
            {
                path: 'local',
                component: MyFiles,
                title: $localize`LOVI - My Files`
            }*/
        ]
    },
    {
        path: 'search',
        component: Search,
        title: $localize`LOVI - Search`,
    },

    {
        path: 'edit',
        loadComponent: () => import('./pages/edit/edit').then(m => m.Edit),
        title: $localize`LOVI - Edit`,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
    },
    {
        path: 'edit/books/create',
        loadComponent: () => import('./pages/edit/edit-book/edit-book').then(m => m.EditBook),
        title: $localize`LOVI - Create Book`,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
    },
    {
        path: 'edit/books/:id',
        loadComponent: () => import('./pages/edit/edit-book/edit-book').then(m => m.EditBook),
        title: $localize`LOVI - Edit Book`,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
        resolve: {
            book: bookResolver
        }
    },
    {
        path: 'edit/podcasts/create',
        loadComponent: () => import('./pages/edit/edit-podcast/edit-podcast').then(m => m.EditPodcast),
        title: $localize`LOVI - Create Podcast`,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
    },
    {
        path: 'edit/podcasts/:id',
        title: $localize`LOVI - Edit Podcast`,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
        children: [
            {
                path: '',
                loadComponent: () => import('./pages/edit/edit-podcast/edit-podcast').then(m => m.EditPodcast),
                resolve: {
                    podcast: podcastResolver
                },
            },
            {
                path: 'episodes/create',
                loadComponent: () => import('./pages/edit/edit-podcast/edit-podcast-episode/edit-podcast-episode').then(m => m.EditPodcastEpisode),
                title: $localize`LOVI - Create Podcast Episode`,
                resolve: {
                    podcast: podcastResolver
                }
            },
            {
                path: 'episodes/:episodeId',
                loadComponent: () => import('./pages/edit/edit-podcast/edit-podcast-episode/edit-podcast-episode').then(m => m.EditPodcastEpisode),
                title: $localize`LOVI - Edit Podcast Episode`,
                resolve: {
                    podcast: podcastResolver,
                    podcastEpisode: podcastEpisodeResolver
                }
            }
        ]
    },
    {
        path: 'edit/creators/create',
        loadComponent: () => import('./pages/edit/edit-creator/edit-creator').then(m => m.EditCreator),
        title: $localize`LOVI - Create Creator`,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
    },
    {
        path: 'edit/creators/:id',
        loadComponent: () => import('./pages/edit/edit-creator/edit-creator').then(m => m.EditCreator),
        title: $localize`LOVI - Edit Creator`,
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
        resolve: {
            creator: creatorResolver
        }
    },
    {
        path: 'edit/users/create',
        loadComponent: () => import('./pages/edit/edit-user/edit-user').then(m => m.EditUser),
        title: $localize`LOVI - Create User`,
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
    },
    {
        path: 'edit/users/:id',
        loadComponent: () => import('./pages/edit/edit-user/edit-user').then(m => m.EditUser),
        title: $localize`LOVI - Edit User`,
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        resolve: {
            user: userResolver
        }
    },
    {
        path: 'edit/roles/create',
        loadComponent: () => import('./pages/edit/edit-role/edit-role').then(m => m.EditRole),
        title: $localize`LOVI - Create Role`,
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
    },
    {
        path: 'edit/roles/:id',
        loadComponent: () => import('./pages/edit/edit-role/edit-role').then(m => m.EditRole),
        title: $localize`LOVI - Edit Role`,
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        resolve: {
            role: roleResolver
        }
    },

    {
        path: 'about-us',
        component: AboutUs,
        title: $localize`LOVI - About Us`,
    },

    {
        path: 'not-found',
        component: NotFound,
        title: $localize`LOVI - Not Found`,
    },
    {
        path: 'forbidden',
        component: Forbidden,
        title: $localize`LOVI - Access Denied`,
    },
    {
        path: '**',
        component: NotFound,
        title: $localize`LOVI - Not Found`,
    }

];
