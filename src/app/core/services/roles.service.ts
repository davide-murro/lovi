import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResult } from '../models/dtos/pagination/paged-result.model';
import { PagedQuery } from '../models/dtos/pagination/paged-query.model';
import { RoleDto } from '../models/dtos/auth/role-dto.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = environment.apiUrl + '/roles'; // adjust port to your API
  private http = inject(HttpClient);


  // GET all roles
  getAll(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(this.apiUrl);
  }

  // GET role by id
  getById(id: string): Observable<RoleDto> {
    return this.http.get<RoleDto>(`${this.apiUrl}/${id}`);
  }

  // POST create role
  create(podcast: RoleDto): Observable<RoleDto> {
    return this.http.post<RoleDto>(this.apiUrl, podcast);
  }

  // PUT update role
  update(id: string, podcast: RoleDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, podcast);
  }

  // DELETE role
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET paged roles
  getPaged(query: PagedQuery): Observable<PagedResult<RoleDto>> {
    const params = new HttpParams({ fromObject: { ...query } });
    return this.http.get<PagedResult<RoleDto>>(`${this.apiUrl}/paged`, { params });
  }
}
