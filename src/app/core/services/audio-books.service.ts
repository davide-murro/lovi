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
    return this.http.post<AudioBookDto>(this.apiUrl, audioBook);
  }

  // PUT update audioBook
  update(id: number, audioBook: AudioBookDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, audioBook);
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

}
