import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { bookResolver } from "./core/resolvers/book.resolver";
import { creatorResolver } from "./core/resolvers/creator.resolver";
import { podcastEpisodeResolver } from "./core/resolvers/podcast-episode.resolver";
import { podcastResolver } from "./core/resolvers/podcast.resolver";
import { roleResolver } from "./core/resolvers/role.resolver";
import { userProfileResolver } from "./core/resolvers/user-profile.resolver";
import { userResolver } from "./core/resolvers/user.resolver";
import { BookDetails } from "./pages/books/book-details/book-details";
import { Books } from "./pages/books/books";
import { EditBook } from "./pages/edit/edit-book/edit-book";

import { ConfirmChangeEmail } from "./pages/auth/confirm-change-email/confirm-change-email";
import { ConfirmEmail } from "./pages/auth/confirm-email/confirm-email";
import { ForgotPassword } from "./pages/auth/forgot-password/forgot-password";
import { Login } from "./pages/auth/login/login";
import { Register } from "./pages/auth/register/register";
import { Edit } from "./pages/edit/edit";

import { EditCreator } from "./pages/edit/edit-creator/edit-creator";
import { EditPodcast } from "./pages/edit/edit-podcast/edit-podcast";
import { EditPodcastEpisode } from "./pages/edit/edit-podcast/edit-podcast-episode/edit-podcast-episode";
import { EditRole } from "./pages/edit/edit-role/edit-role";
import { EditUser } from "./pages/edit/edit-user/edit-user";
import { Home } from "./pages/home/home";
import { MyLibraryContainer } from "./pages/my-library-container/my-library-container";
import { MyLibrary } from "./pages/my-library-container/my-library/my-library";
import { MyOffline } from "./pages/my-library-container/my-offline/my-offline";
import { PodcastDetails } from "./pages/podcasts/podcast-details/podcast-details";
import { PodcastEpisodeDetails } from "./pages/podcasts/podcast-details/podcast-episode-details/podcast-episode-details";
import { Podcasts } from "./pages/podcasts/podcasts";
import { Search } from "./pages/search/search";
import { UserProfile } from "./pages/user-profile/user-profile";
import { NotFound } from "./shared/not-found/not-found";


export const routes: Routes = [
    {
        path: '',
        component: Home,
        title: 'LOVI - Home Page'
    },
    {
        path: 'auth/login',
        component: Login,
        title: 'LOVI - Log In'
    },
    {
        path: 'auth/register',
        component: Register,
        title: 'LOVI - Register'
    },
    {
        path: 'auth/confirm-email',
        component: ConfirmEmail,
        title: 'LOVI - Confirm Email'
    },
    {
        path: 'auth/forgot-password',
        component: ForgotPassword,
        title: 'LOVI - Forgot Password'
    },
    {
        path: 'auth/confirm-change-email',
        component: ConfirmChangeEmail,
        title: 'LOVI - Confirm Change Email'
    },
    {
        path: 'user-profile',
        component: UserProfile,
        title: 'LOVI - User Profile',
        canActivate: [authGuard],
        resolve: {
            userProfile: userProfileResolver
        },
    },
    {
        path: 'books',
        component: Books,
        title: 'LOVI - Books'
    },
    {
        path: 'books/:id',
        component: BookDetails,
        title: 'LOVI - Book Details',
        resolve: {
            book: bookResolver
        },
    },
    {
        path: 'podcasts',
        component: Podcasts,
        title: 'LOVI - Podcasts'
    },
    {
        path: 'podcasts/:id',
        title: 'LOVI - Podcast Details',
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
                title: 'LOVI - Podcast Episode Details',
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
                title: 'LOVI - My Library'
            },
            {
                path: 'offline',
                component: MyOffline,
                title: 'LOVI - My Offline'
            }/*,
            {
                path: 'local',
                component: MyFiles,
                title: 'LOVI - My Files'
            }*/
        ]
    },
    {
        path: 'search',
        component: Search,
        title: 'LOVI - Search',
    },

    {
        path: 'edit',
        component: Edit,
        title: 'LOVI - Edit',
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
    },
    {
        path: 'edit/books/create',
        component: EditBook,
        title: 'LOVI - Create Book',
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
    },
    {
        path: 'edit/books/:id',
        component: EditBook,
        title: 'LOVI - Edit Book',
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
        resolve: {
            book: bookResolver
        }
    },
    {
        path: 'edit/podcasts/create',
        component: EditPodcast,
        title: 'LOVI - Create Podcast',
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
    },
    {
        path: 'edit/podcasts/:id',
        title: 'LOVI - Edit Podcast',
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
        children: [
            {
                path: '',
                component: EditPodcast,
                resolve: {
                    podcast: podcastResolver
                },
            },
            {
                path: 'episodes/create',
                component: EditPodcastEpisode,
                title: 'LOVI - Create Podcast Episode',
                resolve: {
                    podcast: podcastResolver
                }
            },
            {
                path: 'episodes/:episodeId',
                component: EditPodcastEpisode,
                title: 'LOVI - Edit Podcast Episode',
                resolve: {
                    podcast: podcastResolver,
                    podcastEpisode: podcastEpisodeResolver
                }
            }
        ]
    },
    {
        path: 'edit/creators/create',
        component: EditCreator,
        title: 'LOVI - Create Creator',
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
    },
    {
        path: 'edit/creators/:id',
        component: EditCreator,
        title: 'LOVI - Edit Creator',
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Editor'] },
        resolve: {
            creator: creatorResolver
        }
    },
    {
        path: 'edit/users/create',
        component: EditUser,
        title: 'LOVI - Create User',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
    },
    {
        path: 'edit/users/:id',
        component: EditUser,
        title: 'LOVI - Edit User',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        resolve: {
            user: userResolver
        }
    },
    {
        path: 'edit/roles/create',
        component: EditRole,
        title: 'LOVI - Create Role',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
    },
    {
        path: 'edit/roles/:id',
        component: EditRole,
        title: 'LOVI - Edit Role',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        resolve: {
            role: roleResolver
        }
    },

    {
        path: 'not-found',
        component: NotFound,
        title: 'LOVI - Not Found',
    },
    {
        path: '**',
        redirectTo: ''
    }

];
