import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EBookDto } from '../models/dtos/e-book-dto.model';
import { PagedResult } from '../models/dtos/pagination/paged-result.model';
import { Observable } from 'rxjs';
import { PagedQuery } from '../models/dtos/pagination/paged-query.model';

@Injectable({
  providedIn: 'root'
})
export class EBooksService {
  private apiUrl = environment.apiUrl + '/e-books'; // adjust port to your API
  private http = inject(HttpClient);


  // GET all eBooks
  getAll(): Observable<EBookDto[]> {
    return this.http.get<EBookDto[]>(this.apiUrl);
  }

  // GET eBook by id
  getById(id: number): Observable<EBookDto> {
    return this.http.get<EBookDto>(`${this.apiUrl}/${id}`);
  }

  // POST create eBook
  create(eBook: EBookDto): Observable<EBookDto> {
    const formData = new FormData();
    formData.append('Name', eBook.name);
    if (eBook.description) formData.append('Description', eBook.description);
    if (eBook.fileUrl) formData.append('FileUrl', eBook.fileUrl);
    if (eBook.file) formData.append('File', eBook.file);
    if (eBook.coverImageUrl) formData.append('CoverImageUrl', eBook.coverImageUrl);
    if (eBook.coverImage) formData.append('CoverImage', eBook.coverImage);
    if (eBook.coverImagePreviewUrl) formData.append('CoverImagePreviewUrl', eBook.coverImagePreviewUrl);
    if (eBook.coverImagePreview) formData.append('CoverImagePreview', eBook.coverImagePreview);
    return this.http.post<EBookDto>(this.apiUrl, formData);
  }

  // PUT update eBook
  update(id: number, eBook: EBookDto): Observable<void> {
    const formData = new FormData();
    formData.append('Id', eBook.id!.toString());
    formData.append('Name', eBook.name);
    if (eBook.description) formData.append('Description', eBook.description);
    if (eBook.fileUrl) formData.append('FileUrl', eBook.fileUrl);
    if (eBook.file) formData.append('File', eBook.file);
    if (eBook.coverImageUrl) formData.append('CoverImageUrl', eBook.coverImageUrl);
    if (eBook.coverImage) formData.append('CoverImage', eBook.coverImage);
    if (eBook.coverImagePreviewUrl) formData.append('CoverImagePreviewUrl', eBook.coverImagePreviewUrl);
    if (eBook.coverImagePreview) formData.append('CoverImagePreview', eBook.coverImagePreview);
    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  // DELETE eBook
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET paged eBooks
  getPaged(query: PagedQuery): Observable<PagedResult<EBookDto>> {
    const params = new HttpParams({ fromObject: { ...query } });
    return this.http.get<PagedResult<EBookDto>>(`${this.apiUrl}/paged`, { params });
  }

  // ADD eBook writer
  addWriter(id: number, writerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/writers/${writerId}`, null);
  }

  // REMOVE eBook writer
  removeWriter(id: number, writerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/writers/${writerId}`);
  }

  // GET eBook cover
  getCover(id: number, isPreview: boolean = false): Observable<Blob> {
    let params = isPreview ? new HttpParams().set('isPreview', 'True') : new HttpParams();
    return this.http.get(`${this.apiUrl}/${id}/cover`, { params, responseType: 'blob' });
  }

  // GET eBook file
  getFile(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/file`, { responseType: 'blob' });
  }
}
