import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { RegisterDto } from '../models/dtos/auth/register-dto.model';
import { finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { LoginDto } from '../models/dtos/auth/login-dto.model';
import { TokenDto } from '../models/dtos/auth/token-dto.model';
import { ChangePasswordDto } from '../models/dtos/auth/change-password-dto.model';
import { ChangeEmailDto } from '../models/dtos/auth/change-email-dto.model';
import { ForgotPasswordDto } from '../models/dtos/auth/forgot-password-dto.model';
import { ResetPasswordDto } from '../models/dtos/auth/reset-password-dto.model';
import { ConfirmEmailDto } from '../models/dtos/auth/confirm-email-dto.model';
import { ConfirmChangeEmailDto } from '../models/dtos/auth/confirm-change-email-dto.model';
import { DeleteAccountDto } from '../models/dtos/auth/delete-account-dto.model';
import { ResendConfirmEmailDto } from '../models/dtos/auth/resend-confirm-email-dto.model';
import { ExternalLoginDto } from '../models/dtos/auth/external-login-dto.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private http = inject(HttpClient);

  private hasSession = signal(localStorage.getItem('authHasSession') === 'true');
  private accessToken = signal<string | null>(null);
  private userRole = signal<string | null>(null);

  private refreshToken$?: Observable<TokenDto> | null;

  isLoggedIn = computed(() => !!this.hasSession());
  isConnected = computed(() => !!this.hasSession() && !!this.accessToken());

  // REGISTER
  register(dto: RegisterDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, dto, { headers: { 'ngsw-bypass': '' } });
  }
  confirmEmail(dto: ConfirmEmailDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/confirm-email`, dto, { headers: { 'ngsw-bypass': '' } });
  }
  resendConfirmEmail(dto: ResendConfirmEmailDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/resend-confirm-email`, dto, { headers: { 'ngsw-bypass': '' } });
  }

  // LOGIN
  login(dto: LoginDto): Observable<TokenDto> {
    return this.http.post<TokenDto>(
      `${this.apiUrl}/login`,
      dto,
      {
        withCredentials: true,
        headers: { 'ngsw-bypass': '' }
      }
    ).pipe(
      tap((tokenDto) => {
        this.setAccessToken(tokenDto.accessToken);
        const payload: any = jwtDecode(tokenDto.accessToken);
        this.setRole(payload.role);
      })
    );
  }

  // EXTERNAL LOGIN
  externalLogin(dto: ExternalLoginDto): Observable<TokenDto> {
    return this.http.post<TokenDto>(
      `${`${this.apiUrl}/external-login`}`,
      dto,
      {
        withCredentials: true,
        headers: { 'ngsw-bypass': '' }
      }
    ).pipe(
      tap((tokenDto) => {
        this.setAccessToken(tokenDto.accessToken);
        const payload: any = jwtDecode(tokenDto.accessToken);
        this.setRole(payload.role);
      })
    );
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('authHasSession');
    this.hasSession.set(false);
    this.accessToken.set(null);
    this.userRole.set(null);
  }

  // REVOKE
  revoke(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/revoke`,
      {},
      {
        withCredentials: true,
        headers: { 'ngsw-bypass': '' }
      }
    ).pipe(
      tap(() => this.logout())
    );
  }
  // REVOKE ALL DEVICES
  revokeAll(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/revoke-all`,
      {},
      {
        withCredentials: true,
        headers: { 'ngsw-bypass': '' }
      }
    ).pipe(
      tap(() => this.logout())
    );
  }

  // DELETE ACCOUNT
  deleteAccount(dto: DeleteAccountDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete-account`,
      dto,
      {
        withCredentials: true,
        headers: { 'ngsw-bypass': '' }
      }
    ).pipe(
      tap(() => this.logout())
    );
  }

  refreshTokens(): Observable<TokenDto> {
    if (this.refreshToken$) return this.refreshToken$;

    this.refreshToken$ = this.http.post<TokenDto>(
      `${this.apiUrl}/refresh`,
      {},
      {
        withCredentials: true,
        headers: { 'ngsw-bypass': '' }
      }
    ).pipe(
      tap(res => {
        this.setAccessToken(res.accessToken);
        const payload: any = jwtDecode(res.accessToken);
        this.setRole(payload.role);
      }),
      shareReplay(1),
      finalize(() => {
        this.refreshToken$ = undefined;
      })
    );
    return this.refreshToken$;
  }
  ensureTokens(): Observable<void> {
    const token = this.accessToken();
    if (!token) return of(undefined);

    // If token is not expired (in less than 30 seconds), return
    const payload: any = jwtDecode(token);
    if (Date.now() < payload.exp * 1000 - 30000) {
      return of(undefined);
    }

    // Refresh token if it expires
    return this.refreshTokens().pipe(map(() => { }));
  }
  getAccessToken(): string | null {
    return this.accessToken();
  }
  setAccessToken(token: string): void {
    this.accessToken.set(token);
    this.hasSession.set(true);
    localStorage.setItem('authHasSession', 'true');
  }

  // EMAIL
  changeEmail(changeEmail: ChangeEmailDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-email`, changeEmail, { headers: { 'ngsw-bypass': '' } });
  }
  confirmChangeEmail(confirmChangeEmail: ConfirmChangeEmailDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/confirm-change-email`, confirmChangeEmail, { headers: { 'ngsw-bypass': '' } });
  }

  // PASSWORD
  changePassword(changePassword: ChangePasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, changePassword, { headers: { 'ngsw-bypass': '' } });
  }
  forgotPassword(forgotPassword: ForgotPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, forgotPassword, { headers: { 'ngsw-bypass': '' } });
  }
  resetPassword(resetPassword: ResetPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, resetPassword, { headers: { 'ngsw-bypass': '' } });
  }

  // DEVICE ID
  getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('authDeviceId');
    if (!deviceId) {

      // if there is crypto use it, otherwise create it manually
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        deviceId = crypto.randomUUID();
      } else {
        deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      localStorage.setItem('authDeviceId', deviceId);
    }

    return deviceId;
  }

  // ROLES
  setRole(role: string): void {
    this.userRole.set(role);
  }
  getRole(): string | null {
    return this.userRole();
  }
}
