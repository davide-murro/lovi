import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegisterDto } from '../models/dtos/register-dto.model';
import { Observable, tap } from 'rxjs';
import { LoginDto } from '../models/dtos/login-dto.model';
import { TokenDto } from '../models/dtos/token-dto.model';
import { ChangePasswordDto } from '../models/dtos/change-password-dto.model';
import { ChangeEmailDto } from '../models/dtos/change-email-dto.model';
import { ForgotPasswordDto } from '../models/dtos/forgot-password-dto.model';
import { ResetPasswordDto } from '../models/dtos/reset-password-dto.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private http = inject(HttpClient);

  private accessToken = signal(localStorage.getItem('accessToken'));
  private refreshToken = signal(localStorage.getItem('refreshToken'));
  private userRole = signal(localStorage.getItem('userRole'));

  isLoggedIn = computed(() => !!this.accessToken());

  // REGISTER
  register(dto: RegisterDto): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/register`, dto);
  }

  // LOGIN
  login(dto: LoginDto): Observable<TokenDto> {
    return this.http.post<TokenDto>(`${this.apiUrl}/login`, dto).pipe(
      tap((tokenDto) => {
        this.setAccessToken(tokenDto.accessToken);
        this.setRefreshToken(tokenDto.refreshToken);
        // extract from JWT (if it includes a role claim)
        const payload = JSON.parse(atob(tokenDto.accessToken.split('.')[1]));
        this.setRole(payload.role);
      })
    );
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.userRole.set(null);
  }
  
  // REVOKE
  revoke(): Observable<any> {
    return this.http.post(this.apiUrl + '/revoke', {}).pipe(
      tap(() => this.logout())
    );
  }

  // DELETE ACCOUNT
  deleteAccount(): Observable<any> {
    return this.http.delete(this.apiUrl + '/delete-account').pipe(
      tap(() => this.logout())
    );
  }

  // TOKENS
  refreshTokens(): Observable<TokenDto> {
    const dto: TokenDto = {
      accessToken: this.getAccessToken()!,
      refreshToken: this.getRefreshToken()!
    };
    return this.http.post<TokenDto>(`${this.apiUrl}/refresh`, dto).pipe(
      tap(res => {
        this.setAccessToken(res.accessToken);
        this.setRefreshToken(res.refreshToken);
        const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
        this.setRole(payload.role);
      })
    );
  }
  getAccessToken(): string | null {
    return this.accessToken();
  }
  setAccessToken(token: string): void {
    localStorage.setItem('accessToken', token);
    this.accessToken.set(token);
  }
  getRefreshToken(): string | null {
    return this.refreshToken();
  }
  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
    this.refreshToken.set(token);
  }

  // PUT update current user email
  changeEmail(changeEmail: ChangeEmailDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/change-email`, changeEmail);
  }
  // PUT update current user password
  changePassword(changePassword: ChangePasswordDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/change-password`, changePassword);
  }

  // forgot password
  forgotPassword(forgotPassword: ForgotPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/forgot-password`, forgotPassword);
  }
  // reset password
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
    localStorage.setItem('userRole', role);
    this.userRole.set(role);
  }
  getRole(): string | null {
    return this.userRole();
  }
}
