import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BookDto } from '../models/dtos/book-dto.model';
import { PagedResult } from '../models/dtos/pagination/paged-result.model';
import { Observable } from 'rxjs';
import { PagedQuery } from '../models/dtos/pagination/paged-query.model';

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  private apiUrl = environment.apiUrl + '/books';
  private http = inject(HttpClient);

  getAll(): Observable<BookDto[]> {
    return this.http.get<BookDto[]>(this.apiUrl);
  }

  getById(id: number): Observable<BookDto> {
    return this.http.get<BookDto>(`${this.apiUrl}/${id}`);
  }

  create(book: BookDto): Observable<BookDto> {
    const formData = new FormData();
    formData.append('Name', book.name);
    if (book.description) formData.append('Description', book.description);

    if (book.coverImageUrl) formData.append('CoverImageUrl', book.coverImageUrl);
    if (book.coverImage) formData.append('CoverImage', book.coverImage);
    if (book.coverImagePreviewUrl) formData.append('CoverImagePreviewUrl', book.coverImagePreviewUrl);
    if (book.coverImagePreview) formData.append('CoverImagePreview', book.coverImagePreview);

    if (book.audioUrl) formData.append('AudioUrl', book.audioUrl);
    if (book.audio) formData.append('Audio', book.audio);

    if (book.fileUrl) formData.append('FileUrl', book.fileUrl);
    if (book.file) formData.append('File', book.file);

    return this.http.post<BookDto>(this.apiUrl, formData);
  }

  update(id: number, book: BookDto): Observable<void> {
    const formData = new FormData();
    formData.append('Id', book.id!.toString());
    formData.append('Name', book.name);
    if (book.description) formData.append('Description', book.description);

    if (book.coverImageUrl) formData.append('CoverImageUrl', book.coverImageUrl);
    if (book.coverImage) formData.append('CoverImage', book.coverImage);
    if (book.coverImagePreviewUrl) formData.append('CoverImagePreviewUrl', book.coverImagePreviewUrl);
    if (book.coverImagePreview) formData.append('CoverImagePreview', book.coverImagePreview);

    if (book.audioUrl) formData.append('AudioUrl', book.audioUrl);
    if (book.audio) formData.append('Audio', book.audio);

    if (book.fileUrl) formData.append('FileUrl', book.fileUrl);
    if (book.file) formData.append('File', book.file);

    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPaged(query: PagedQuery): Observable<PagedResult<BookDto>> {
    const params = new HttpParams({ fromObject: { ...query } });
    return this.http.get<PagedResult<BookDto>>(`${this.apiUrl}/paged`, { params });
  }

  // Readers
  addReader(id: number, readerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/readers/${readerId}`, null);
  }
  removeReader(id: number, readerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/readers/${readerId}`);
  }

  // Writers
  addWriter(id: number, writerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/writers/${writerId}`, null);
  }
  removeWriter(id: number, writerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/writers/${writerId}`);
  }

  getCover(id: number, isPreview: boolean = false): Observable<Blob> {
    let params = isPreview ? new HttpParams().set('isPreview', 'True') : new HttpParams();
    return this.http.get(`${this.apiUrl}/${id}/cover`, { params, responseType: 'blob' });
  }

  getAudio(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/audio`, { responseType: 'blob' });
  }

  getFile(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/file`, { responseType: 'blob' });
  }
}
