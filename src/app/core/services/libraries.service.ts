import { effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { finalize, map, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { LibraryDto } from '../models/dtos/library-dto.model';
import { ManageLibraryDto } from '../models/dtos/manage-library-dto.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LibrariesService {
  private apiUrl = environment.apiUrl + '/libraries';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getMe$?: Observable<LibraryDto[]>;

  // myLibrary
  private _myLibrary: WritableSignal<LibraryDto[] | null> = signal(null);
  public readonly myLibrary: Signal<LibraryDto[] | null> = this._myLibrary.asReadonly();

  private _isLoading: WritableSignal<boolean> = signal(false);
  public readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn() || this.authService.isConnected()) this.loadMyLibrary();
      else this.removeMyLibrary();
    });
  }

  // Method to fetch data from the API and update the signal
  private loadMyLibrary() {
    this.getMe().subscribe();
  }
  // Method to set my library
  private setMyLibrary(data: LibraryDto[]) {
    this._myLibrary.set(data);
  }
  // Method to remove my library when logout
  private removeMyLibrary() {
    this._myLibrary.set(null);
  }

  // GET my library
  getMe(): Observable<LibraryDto[]> {
    if (this.getMe$) return this.getMe$;

    this._isLoading.set(true);
    this.getMe$ = this.http.get<LibraryDto[]>(`${this.apiUrl}/me`).pipe(
      tap(data => this.setMyLibrary(data)),
      shareReplay(1),
      finalize(() => {
        this._isLoading.set(false);
        this.getMe$ = undefined;
      })
    );

    return this.getMe$;
  }

  // POST create library
  createMe(dto: ManageLibraryDto): Observable<LibraryDto> {
    this._isLoading.set(true);
    return this.http.post<LibraryDto>(`${this.apiUrl}/me`, dto).pipe(
      switchMap((result) => this.getMe().pipe(map(() => result))),
      finalize(() => this._isLoading.set(false))
    );
  }

  // POST create library list
  createMeList(dtos: ManageLibraryDto[]): Observable<LibraryDto[]> {
    this._isLoading.set(true);
    return this.http.post<LibraryDto[]>(`${this.apiUrl}/me/list`, dtos).pipe(
      switchMap((result) => this.getMe().pipe(map(() => result))),
      finalize(() => this._isLoading.set(false))
    );
  }

  // DELETE library
  deleteMe(id: number): Observable<void> {
    this._isLoading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/me/${id}`).pipe(
      switchMap((result) => this.getMe().pipe(map(() => result))),
      finalize(() => this._isLoading.set(false))
    );
  }

  // DELETE all library
  deleteMeAll(): Observable<void> {
    this._isLoading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/me`).pipe(
      switchMap((result) => this.getMe().pipe(map(() => result))),
      finalize(() => this._isLoading.set(false))
    );
  }

  // DELETE library list
  deleteMeList(ids: number[]): Observable<void> {
    this._isLoading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/me/list`, { body: ids })
      .pipe(
        switchMap((result) => this.getMe().pipe(map(() => result))),
        finalize(() => this._isLoading.set(false))
      );
  }
}
