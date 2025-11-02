import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
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

  // myLibrary
  private _myLibrary: WritableSignal<LibraryDto[] | null> = signal(null);
  public readonly myLibrary: Signal<LibraryDto[] | null> = this._myLibrary.asReadonly();

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.loadMyLibrary();
    }
  }

  // Method to fetch data from the API and update the signal
  private loadMyLibrary() {
    this.getMe().subscribe();
  }

  // GET my library
  getMe(): Observable<LibraryDto[]> {
    return this.http.get<LibraryDto[]>(`${this.apiUrl}/me`).pipe(
      tap(data => this._myLibrary.set(data))
    );
  }

  // POST create library
  createMe(dto: ManageLibraryDto): Observable<LibraryDto> {
    return this.http.post<LibraryDto>(`${this.apiUrl}/me`, dto).pipe(
      tap(() => this.loadMyLibrary())
    );
  }

  // POST create library list
  createMeList(dtos: ManageLibraryDto[]): Observable<LibraryDto[]> {
    return this.http.post<LibraryDto[]>(`${this.apiUrl}/me/list`, dtos).pipe(
      tap(() => this.loadMyLibrary())
    );
  }

  // DELETE library
  deleteMe(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/${id}`).pipe(
      tap(() => this.loadMyLibrary())
    );
  }

  // DELETE all library
  deleteMeAll(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me`).pipe(
      tap(() => this.loadMyLibrary())
    );
  }

  // DELETE library list
  deleteMeList(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/list`,
      { body: ids })
      .pipe(
        tap(() => this.loadMyLibrary())
      );
  }
}
