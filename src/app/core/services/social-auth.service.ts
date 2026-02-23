import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const google: any;
declare const FB: any;

@Injectable({
    providedIn: 'root'
})
export class SocialAuthService {
    // IDs are managed in src/environments/environment.ts
    private readonly GOOGLE_CLIENT_ID = environment.googleClientId;
    private readonly FACEBOOK_APP_ID = environment.facebookAppId;
    private readonly SPOTIFY_CLIENT_ID = environment.spotifyClientId;
    private readonly INSTAGRAM_CLIENT_ID = environment.instagramClientId;

    private isGoogleLoaded = signal(false);
    private isFacebookLoaded = signal(false);

    constructor() {
        this.loadGoogleLibrary();
        //this.loadFacebookLibrary();
    }

    // GOOGLE
    private loadGoogleLibrary() {
        if (document.getElementById('google-jssdk')) return;
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = 'google-jssdk';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            this.isGoogleLoaded.set(true);
        };
        document.head.appendChild(script);
    }

    loginWithGoogle(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.isGoogleLoaded()) {
                reject('Google SDK not loaded');
                return;
            }

            try {
                const client = google.accounts.oauth2.initTokenClient({
                    client_id: this.GOOGLE_CLIENT_ID,
                    scope: 'openid email profile',
                    callback: (response: any) => {
                        if (response.error) {
                            reject(response.error);
                            return;
                        }
                        resolve(response.access_token);
                    }
                });

                // Set prompt: 'select_account' to force the account picker
                client.requestAccessToken({ prompt: 'select_account' });
            } catch (err) {
                reject(err);
            }
        });
    }

    // FACEBOOK
    private loadFacebookLibrary() {
        if (document.getElementById('facebook-jssdk')) return;
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.id = 'facebook-jssdk';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            FB.init({
                appId: this.FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
            this.isFacebookLoaded.set(true);
        };
        document.head.appendChild(script);
    }

    loginWithFacebook(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.isFacebookLoaded()) {
                reject('Facebook SDK not loaded');
                return;
            }

            FB.login((response: any) => {
                if (response.authResponse) {
                    resolve(response.authResponse.accessToken);
                } else {
                    reject('User cancelled login or did not fully authorize.');
                }
            }, { scope: 'public_profile,email' });
        });
    }

    // SPOTIFY
    loginWithSpotify(): void {
        const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
        const scope = encodeURIComponent('user-read-private user-read-email');
        const url = `https://accounts.spotify.com/authorize?client_id=${this.SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}`;
        window.location.href = url;
    }

    getSpotifyTokenFromHash(): string | null {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');
        if (token) {
            // Clear hash to avoid re-processing
            window.location.hash = '';
            return token;
        }
        return null;
    }

    // INSTAGRAM
    loginWithInstagram(): void {
        const redirectUri = encodeURIComponent(window.location.origin + '/auth/login');
        const scope = 'user_profile,user_media';
        const url = `https://api.instagram.com/oauth/authorize?client_id=${this.INSTAGRAM_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
        window.location.href = url;
    }

    getInstagramCodeFromQuery(): string | null {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
            // Remove code from URL to avoid re-processing
            const url = new URL(window.location.href);
            url.searchParams.delete('code');
            window.history.replaceState({}, document.title, url.toString());
            return code;
        }
        return null;
    }
}
