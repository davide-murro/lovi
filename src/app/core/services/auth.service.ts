import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { RegisterDto } from '../models/dtos/auth/register-dto.model';
import { Observable, tap } from 'rxjs';
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

  private accessToken = signal<string | null>(null);
  private userRole = signal<string | null>(null);
  private hasSession = signal(localStorage.getItem('hasSession') === 'true');

  isLoggedIn = computed(() => !!this.hasSession());

  // REGISTER
  register(dto: RegisterDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, dto);
  }
  confirmEmail(dto: ConfirmEmailDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/confirm-email`, dto);
  }
  resendConfirmEmail(dto: ResendConfirmEmailDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/resend-confirm-email`, dto);
  }

  // LOGIN
  login(dto: LoginDto): Observable<TokenDto> {
    return this.http.post<TokenDto>(
      `${this.apiUrl}/login`,
      dto,
      { withCredentials: true }
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
      { withCredentials: true }
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
    localStorage.removeItem('hasSession');
    this.hasSession.set(false);
    this.accessToken.set(null);
    this.userRole.set(null);
  }

  // REVOKE
  revoke(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/revoke`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => this.logout())
    );
  }
  // REVOKE ALL DEVICES
  revokeAll(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/revoke-all`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => this.logout())
    );
  }

  // DELETE ACCOUNT
  deleteAccount(dto: DeleteAccountDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/delete-account`, dto).pipe(
      tap(() => this.logout())
    );
  }

  // TOKENS
  refreshTokens(): Observable<TokenDto> {
    return this.http.post<TokenDto>(
      `${this.apiUrl}/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(res => {
        this.setAccessToken(res.accessToken);
        const payload: any = jwtDecode(res.accessToken);
        this.setRole(payload.role);
      })
    );
  }
  getAccessToken(): string | null {
    return this.accessToken();
  }
  setAccessToken(token: string): void {
    this.accessToken.set(token);
    this.hasSession.set(true);
    localStorage.setItem('hasSession', 'true');
  }

  // EMAIL
  changeEmail(changeEmail: ChangeEmailDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-email`, changeEmail);
  }
  confirmChangeEmail(confirmChangeEmail: ConfirmChangeEmailDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/confirm-change-email`, confirmChangeEmail);
  }

  // PASSWORD
  changePassword(changePassword: ChangePasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, changePassword);
  }
  forgotPassword(forgotPassword: ForgotPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, forgotPassword);
  }
  resetPassword(resetPassword: ResetPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, resetPassword);
  }

  // DEVICE ID
  getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
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
      localStorage.setItem('deviceId', deviceId);
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
