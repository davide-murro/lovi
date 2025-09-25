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
  public isLoggedIn = computed(() => this.accessToken());

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
      })
    );
  }
  /*isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }*/

  // LOGOUT
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken.set(null);
    this.refreshToken.set(null);
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
      deviceId = crypto.randomUUID();
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }
}
