import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const google: any;
//declare const FB: any;

@Injectable({
    providedIn: 'root'
})
export class SocialAuthService {
    // IDs are managed in src/environments/environment.ts
    private readonly GOOGLE_CLIENT_ID = environment.googleClientId;
    private readonly SPOTIFY_CLIENT_ID = environment.spotifyClientId;
    //private readonly FACEBOOK_APP_ID = environment.facebookAppId;
    //private readonly INSTAGRAM_CLIENT_ID = environment.instagramClientId;

    private isGoogleLoaded = signal(false);
    //private isFacebookLoaded = signal(false);

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

    // SPOTIFY (Authorization Code + PKCE)
    async loginWithSpotify(): Promise<void> {
        const codeVerifier = this.generateCodeVerifier();
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);

        // Store verifier to use during callback
        sessionStorage.setItem('authSpotifyCodeVerifier', codeVerifier);

        const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
        const scope = encodeURIComponent('user-read-private user-read-email');
        const url = `https://accounts.spotify.com/authorize?client_id=${this.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&code_challenge_method=S256&code_challenge=${codeChallenge}`;
        window.location.href = url;
    }

    async getSpotifyTokenFromCode(): Promise<string | null> {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (!code) return null;

        // Remove code from URL to avoid re-processing
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        window.history.replaceState({}, document.title, url.toString());

        const codeVerifier = sessionStorage.getItem('authSpotifyCodeVerifier');
        if (!codeVerifier) return null;
        sessionStorage.removeItem('authSpotifyCodeVerifier');

        const redirectUri = window.location.origin + window.location.pathname;
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: this.SPOTIFY_CLIENT_ID,
            code_verifier: codeVerifier
        });

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.access_token ?? null;
    }

    private generateCodeVerifier(): string {
        const array = new Uint8Array(64);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    private async generateCodeChallenge(verifier: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    /*
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
    */
}
