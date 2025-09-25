import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../models/dtos/user-dto.model';

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
  getById(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/${id}`);
  }

  // POST create user
  create(user: UserDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.apiUrl, user);
  }

  // PUT update user
  update(id: number, user: UserDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, user);
  }

  // DELETE user
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  // GET current user
  getMe(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/me`);
  }
  
  // PUT update current user
  updateMe(user: UserDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/me`, user);
  }
}
