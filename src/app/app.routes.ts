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
        title: 'LOVI - User profile',
        canActivate: [authGuard],
        //data: { roles: ['Admin'] },
        resolve: {
            userProfile: userProfileResolver
        }
    },
    {
        path: 'podcasts',
        component: Podcasts,
        title: 'LOVI - Podcasts'
    },
    {
        path: 'podcasts/:id',
        component: PodcastDetails,
        title: 'LOVI - Podcast details',
        resolve: {
            podcast: podcastResolver // Resolver runs before 'podcasts/:id' component loads
        }
    },
    {
        path: 'podcasts/:id/episodes/:episodeId',
        component: PodcastEpisode,
        title: 'LOVI - Podcast episode',
        resolve: {
            podcastEpisode: podcastEpisodeResolver
        }
    },
    {
        path: 'my-library',
        component: MyLibrary,
        title: 'LOVI - My Library',
        canActivate: [authGuard],
        resolve: {
            myLibrary: myLibraryResolver
        }
    },
    {
        path: '**',
        redirectTo: ''
    }

];
