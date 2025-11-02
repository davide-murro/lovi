import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AudioBookDto } from '../models/dtos/audio-book-dto.model';
import { PagedResult } from '../models/dtos/pagination/paged-result.model';
import { Observable } from 'rxjs';
import { PagedQuery } from '../models/dtos/pagination/paged-query.model';

@Injectable({
  providedIn: 'root'
})
export class AudioBooksService {
  private apiUrl = environment.apiUrl + '/audio-books'; // adjust port to your API
  private http = inject(HttpClient);


  // GET all audioBooks
  getAll(): Observable<AudioBookDto[]> {
    return this.http.get<AudioBookDto[]>(this.apiUrl);
  }

  // GET audioBook by id
  getById(id: number): Observable<AudioBookDto> {
    return this.http.get<AudioBookDto>(`${this.apiUrl}/${id}`);
  }

  // POST create audioBook
  create(audioBook: AudioBookDto): Observable<AudioBookDto> {
    const formData = new FormData();
    formData.append('Name', audioBook.name);
    if (audioBook.description) formData.append('Description', audioBook.description);
    if (audioBook.coverImageUrl) formData.append('CoverImageUrl', audioBook.coverImageUrl);
    if (audioBook.coverImage) formData.append('CoverImage', audioBook.coverImage);
    if (audioBook.coverImagePreviewUrl) formData.append('CoverImagePreviewUrl', audioBook.coverImagePreviewUrl);
    if (audioBook.coverImagePreview) formData.append('CoverImagePreview', audioBook.coverImagePreview);
    if (audioBook.audioUrl) formData.append('AudioUrl', audioBook.audioUrl);
    if (audioBook.audio) formData.append('Audio', audioBook.audio);
    return this.http.post<AudioBookDto>(this.apiUrl, formData);
  }

  // PUT update audioBook
  update(id: number, audioBook: AudioBookDto): Observable<void> {
    const formData = new FormData();
    formData.append('Id', audioBook.id!.toString());
    formData.append('Name', audioBook.name);
    if (audioBook.description) formData.append('Description', audioBook.description);
    if (audioBook.coverImageUrl) formData.append('CoverImageUrl', audioBook.coverImageUrl);
    if (audioBook.coverImage) formData.append('CoverImage', audioBook.coverImage);
    if (audioBook.coverImagePreviewUrl) formData.append('CoverImagePreviewUrl', audioBook.coverImagePreviewUrl);
    if (audioBook.coverImagePreview) formData.append('CoverImagePreview', audioBook.coverImagePreview);
    if (audioBook.audioUrl) formData.append('AudioUrl', audioBook.audioUrl);
    if (audioBook.audio) formData.append('Audio', audioBook.audio);
    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  // DELETE audioBook
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET paged audioBooks
  getPaged(query: PagedQuery): Observable<PagedResult<AudioBookDto>> {
    const params = new HttpParams({ fromObject: { ...query } });
    return this.http.get<PagedResult<AudioBookDto>>(`${this.apiUrl}/paged`, { params });
  }

  // ADD audioBook reader
  addReader(id: number, readerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/readers/${readerId}`, null);
  }

  // REMOVE audioBook reader
  removeReader(id: number, readerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/readers/${readerId}`);
  }

}
