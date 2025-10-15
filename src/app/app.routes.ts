import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { authGuard } from './core/guards/auth.guard';
import { UserProfile } from './features/user-profile/user-profile';
import { Podcasts } from './features/podcasts/podcasts';
import { PodcastDetails } from './features/podcasts/podcast-details/podcast-details';
import { PodcastEpisode } from './features/podcasts/podcast-details/podcast-episode/podcast-episode';
import { podcastResolver } from './core/resolvers/podcast.resolver';
import { podcastEpisodeResolver } from './core/resolvers/podcast-episode.resolver';
import { userProfileResolver } from './core/resolvers/user-profile.resolver';
import { MyLibrary } from './features/my-library/my-library';
import { myLibraryResolver } from './core/resolvers/my-library.resolver';
import { AudioBooks } from './features/audio-books/audio-books';
import { AudioBookDetails } from './features/audio-books/audio-book-details/audio-book-details';
import { audioBookResolver } from './core/resolvers/audio-book.resolver';
import { Edit } from './features/edit/edit';
import { EditPodcast } from './features/edit/edit-podcast/edit-podcast';
import { EditPodcastEpisode } from './features/edit/edit-podcast/edit-podcast-episode/edit-podcast-episode';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        title: 'LOVI - Home page'
    },
    {
        path: 'login',
        component: Login,
        title: 'LOVI - Log in'
    },
    {
        path: 'register',
        component: Register,
        title: 'LOVI - Register'
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
        path: 'audio-books',
        component: AudioBooks,
        title: 'LOVI - Audio Books'
    },
    {
        path: 'audio-books/:id',
        component: AudioBookDetails,
        title: 'LOVI - Audio Books Details',
        resolve: {
            audioBook: audioBookResolver
        },
    },
    {
        path: 'podcasts',
        component: Podcasts,
        title: 'LOVI - Podcasts'
    },
    {
        path: 'podcasts/:id',
        component: PodcastDetails,
        title: 'LOVI - Podcast Details',
        resolve: {
            podcast: podcastResolver // Resolver runs before 'podcasts/:id' component loads
        },
    },
    {
        path: 'podcasts/:id/episodes/:episodeId',
        component: PodcastEpisode,
        title: 'LOVI - Podcast Episode',
        resolve: {
            podcastEpisode: podcastEpisodeResolver
        },
    },
    {
        path: 'my-library',
        component: MyLibrary,
        title: 'LOVI - My Library',
        canActivate: [authGuard],
        resolve: {
            myLibrary: myLibraryResolver
        },
    },

    {
        path: 'edit',
        component: Edit,
        title: 'LOVI - Edit',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
    },
    {
        path: 'edit/podcasts/create',
        component: EditPodcast,
        title: 'LOVI - Create Podcast',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
    },
    {
        path: 'edit/podcasts/:id',
        component: EditPodcast,
        title: 'LOVI - Edit Podcast',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        resolve: {
            podcast: podcastResolver
        }
    },
    {
        path: 'edit/podcasts/:id/episodes/create',
        component: EditPodcastEpisode,
        title: 'LOVI - Create Podcast Episode',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        resolve: {
            podcast: podcastResolver
        }
    },
    {
        path: 'edit/podcasts/:id/episodes/:episodeId',
        component: EditPodcastEpisode,
        title: 'LOVI - Edit Podcast Episode',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        resolve: {
            podcastEpisode: podcastEpisodeResolver
        }
    },

    {
        path: '**',
        redirectTo: ''
    }

];
