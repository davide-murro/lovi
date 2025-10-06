import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RegisterDto } from '../models/dtos/register-dto.model';
import { Observable, tap } from 'rxjs';
import { LoginDto } from '../models/dtos/login-dto.model';
import { TokenDto } from '../models/dtos/token-dto.model';

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
    return this.http.post(`${this.apiUrl}/register`, dto, { responseType: 'text' });
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

  // REVOKE
  revoke(): Observable<any> {
    return this.http.post(this.apiUrl + '/revoke', {}).pipe(
      tap(() => this.logout())
    );
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
