import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PodcastDto } from '../models/dtos/podcast-dto.model';

@Injectable({
  providedIn: 'root'
})
export class PodcastsService {
  private apiUrl = environment.apiUrl + '/podcasts'; // adjust port to your API
  private http = inject(HttpClient);


  // GET all podcasts
  getAll(): Observable<PodcastDto[]> {
    return this.http.get<PodcastDto[]>(this.apiUrl);
  }

  // GET podcast by id
  getById(id: number): Observable<PodcastDto> {
    return this.http.get<PodcastDto>(`${this.apiUrl}/${id}`);
  }

  // POST create podcast
  create(podcast: PodcastDto): Observable<PodcastDto> {
    return this.http.post<PodcastDto>(this.apiUrl, podcast);
  }

  // PUT update podcast
  update(id: number, podcast: PodcastDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, podcast);
  }

  // DELETE podcast
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
