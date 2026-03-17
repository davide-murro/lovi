import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginDto } from '../../../core/models/dtos/auth/login-dto.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToasterService } from '../../../core/services/toaster.service';
import { DialogService } from '../../../core/services/dialog.service';
import { ResendChangeEmailDialog } from '../../../shared/auth/resend-change-email-dialog/resend-change-email-dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebook, faGoogle, faInstagram, faSpotify } from '@fortawesome/free-brands-svg-icons';
import { ExternalLoginDto } from '../../../core/models/dtos/auth/external-login-dto.model';
import { SocialAuthService } from '../../../core/services/social-auth.service';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, FontAwesomeModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toasterService = inject(ToasterService);
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);
  private socialAuthService = inject(SocialAuthService);

  faGoogle = faGoogle;
  faFacebook = faFacebook;
  faInstagram = faInstagram;
  faSpotify = faSpotify;
  faEye = faEye;

  redirect = toSignal(this.route.queryParams.pipe(map(data => data['redirect'] ?? '/')));

  showPassword = signal(false);

  constructor() {
    //this.checkSpotifyCallback();
    //this.checkInstagramCallback();
  }

  form = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', Validators.required),
  });

  isLoading = signal(false);

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  login(): void {
    if (!this.form.valid) return;

    let dto: LoginDto = {
      userName: this.form.value.userName!,
      password: this.form.value.password!
    }

    this.isLoading.set(true);
    this.authService.login(dto).subscribe({
      next: (token) => {
        this.toasterService.show($localize`Login successful`, { type: 'success' });
        this.router.navigate([this.redirect()]);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('authService.login', dto, err);
        this.isLoading.set(false);

        if ((Array.isArray(err.error) && err.error.some((e: any) => e.code === 'EmailNotConfirmed'))) {
          this.dialogService.open(ResendChangeEmailDialog, { data: { email: dto.userName } });
        } else {
          this.toasterService.show($localize`Login failed`, { type: 'error' });
        }
      }
    })
  }

  loginWithGoogle(): void {
    this.socialAuthService.loginWithGoogle().then(token => {
      this.externalLogin('Google', token);
    }).catch(err => {
      this.toasterService.show($localize`Google login failed`, { type: 'error' });
    });
  }

  loginWithFacebook(): void {
    this.socialAuthService.loginWithFacebook().then(token => {
      this.externalLogin('Facebook', token);
    }).catch(err => {
      this.toasterService.show($localize`Facebook login failed`, { type: 'error' });
    });
  }

  loginWithInstagram(): void {
    this.socialAuthService.loginWithInstagram();
  }

  loginWithSpotify(): void {
    this.socialAuthService.loginWithSpotify();
  }

  private checkSpotifyCallback(): void {
    const token = this.socialAuthService.getSpotifyTokenFromHash();
    if (token) {
      this.externalLogin('Spotify', token);
    }
  }

  private checkInstagramCallback(): void {
    const code = this.socialAuthService.getInstagramCodeFromQuery();
    if (code) {
      this.externalLogin('Instagram', code);
    }
  }

  private externalLogin(provider: string, token: string): void {
    const dto: ExternalLoginDto = {
      provider: provider,
      accessToken: token
    };

    this.isLoading.set(true);
    this.authService.externalLogin(dto).subscribe({
      next: () => {
        this.toasterService.show($localize`${provider} login successful`, { type: 'success' });
        this.router.navigate(['/']);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('authService.externalLogin', dto, err);
        this.isLoading.set(false);
        this.toasterService.show($localize`${provider} login failed`, { type: 'error' });
      }
    });
  }
}
