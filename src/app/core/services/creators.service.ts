import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatorDto } from '../models/dtos/creator-dto.model';
import { PagedQuery } from '../models/dtos/pagination/paged-query.model';
import { PagedResult } from '../models/dtos/pagination/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class CreatorsService {
  private apiUrl = environment.apiUrl + '/creators'; // adjust port to your API
  private http = inject(HttpClient);


  // GET all creators
  getAll(): Observable<CreatorDto[]> {
    return this.http.get<CreatorDto[]>(this.apiUrl);
  }

  // GET creator by id
  getById(id: number): Observable<CreatorDto> {
    return this.http.get<CreatorDto>(`${this.apiUrl}/${id}`);
  }

  // POST create creator
  create(podcast: CreatorDto): Observable<CreatorDto> {
    return this.http.post<CreatorDto>(this.apiUrl, podcast);
  }

  // PUT update creator
  update(id: number, podcast: CreatorDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, podcast);
  }

  // DELETE creator
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET paged creators
  getPaged(query: PagedQuery): Observable<PagedResult<CreatorDto>> {
    const params = new HttpParams({ fromObject: { ...query } });
    return this.http.get<PagedResult<CreatorDto>>(`${this.apiUrl}/paged`, { params });
  }

  // GET creator cover
  getCover(id: number, isPreview: boolean = false): Observable<Blob> {
    let params = isPreview ? new HttpParams().set('isPreview', 'True') : new HttpParams();
    return this.http.get(`${this.apiUrl}/${id}/cover`, { params, responseType: 'blob' });
  }
}
