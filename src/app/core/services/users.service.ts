import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../models/dtos/user-dto.model';
import { PagedQuery } from '../models/dtos/pagination/paged-query.model';
import { PagedResult } from '../models/dtos/pagination/paged-result.model';
import { UserProfileDto } from '../models/dtos/user-profile-dto.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.apiUrl + '/users';
  private http = inject(HttpClient);


  // GET all users
  getAll(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.apiUrl);
  }

  // GET user by id
  getById(id: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/${id}`);
  }

  // POST create user
  create(user: UserDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.apiUrl, user);
  }

  // PUT update user
  update(id: string, user: UserDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, user);
  }

  // DELETE user
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET paged users
  getPaged(query: PagedQuery): Observable<PagedResult<UserDto>> {
    const params = new HttpParams({ fromObject: { ...query } });
    return this.http.get<PagedResult<UserDto>>(`${this.apiUrl}/paged`, { params });
  }
  
  // GET current user
  getMe(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}/profiles/me`);
  }
  
  // PUT update current user
  updateMe(user: UserProfileDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/profiles/me`, user);
  }
}
