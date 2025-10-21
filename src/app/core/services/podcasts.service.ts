import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PodcastDto } from '../models/dtos/podcast-dto.model';
import { PagedQuery } from '../models/dtos/pagination/paged-query.model';
import { PagedResult } from '../models/dtos/pagination/paged-result.model';
import { PodcastEpisodeDto } from '../models/dtos/podcast-episode-dto.model';
import { CreatorDto } from '../models/dtos/creator-dto.model';

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
    const formData = new FormData();
    formData.append('Name', podcast.name);
    if (podcast.description) formData.append('Description', podcast.description);
    if (podcast.coverImageUrl) formData.append('CoverImageUrl', podcast.coverImageUrl);
    if (podcast.coverImage) formData.append('CoverImage', podcast.coverImage);
    return this.http.post<PodcastDto>(this.apiUrl, formData);
  }

  // PUT update podcast
  update(id: number, podcast: PodcastDto): Observable<void> {
    const formData = new FormData();
    formData.append('Id', podcast.id!.toString());
    formData.append('Name', podcast.name);
    if (podcast.description) formData.append('Description', podcast.description);
    if (podcast.coverImageUrl) formData.append('CoverImageUrl', podcast.coverImageUrl);
    if (podcast.coverImage) formData.append('CoverImage', podcast.coverImage);
    return this.http.put<void>(`${this.apiUrl}/${id}`, formData);
  }

  // DELETE podcast
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET paged podcasts
  getPaged(query: PagedQuery): Observable<PagedResult<PodcastDto>> {
    const params = new HttpParams({ fromObject: { ...query } });
    return this.http.get<PagedResult<PodcastDto>>(`${this.apiUrl}/paged`, { params });
  }

  // ADD podcast voicer
  addVoicer(id: number, voicerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/voicers/${voicerId}`, null);
  }

  // REMOVE podcast voicer
  removeVoicer(id: number, voicerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/voicers/${voicerId}`);
  }

  // GET podcast by id
  getEpisodeById(id: number, episodeId: number): Observable<PodcastEpisodeDto> {
    return this.http.get<PodcastEpisodeDto>(`${this.apiUrl}/${id}/episodes/${episodeId}`);
  }

  // POST create podcast episode
  createEpisode(id: number, episode: PodcastEpisodeDto): Observable<PodcastEpisodeDto> {
    const formData = new FormData();
    formData.append('Number', episode.number.toString());
    formData.append('Name', episode.name);
    if (episode.description) formData.append('Description', episode.description);
    if (episode.coverImageUrl) formData.append('CoverImageUrl', episode.coverImageUrl);
    if (episode.coverImage) formData.append('CoverImage', episode.coverImage);
    if (episode.audioUrl) formData.append('AudioUrl', episode.audioUrl);
    if (episode.audio) formData.append('Audio', episode.audio);
    if (episode.podcastId) formData.append('PodcastId', episode.podcastId.toString());
    return this.http.post<PodcastEpisodeDto>(`${this.apiUrl}/${id}/episodes`, formData);
  }

  // PUT update podcast episode
  updateEpisode(id: number, episodeId: number, episode: PodcastEpisodeDto): Observable<PodcastEpisodeDto> {
    const formData = new FormData();
    formData.append('Id', episode.id!.toString());
    formData.append('Number', episode.number.toString());
    formData.append('Name', episode.name);
    if (episode.description) formData.append('Description', episode.description);
    if (episode.coverImageUrl) formData.append('CoverImageUrl', episode.coverImageUrl);
    if (episode.coverImage) formData.append('CoverImage', episode.coverImage);
    if (episode.audioUrl) formData.append('AudioUrl', episode.audioUrl);
    if (episode.audio) formData.append('Audio', episode.audio);
    if (episode.podcastId) formData.append('PodcastId', episode.podcastId.toString());
    return this.http.put<PodcastEpisodeDto>(`${this.apiUrl}/${id}/episodes/${episodeId}`, formData);
  }

  // DELETE podcast episode
  deleteEpisode(id: number, episodeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/episodes/${episodeId}`);
  }

  // ADD podcast episode voicer
  addEpisodeVoicer(id: number, episodeId: number, voicerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/episodes/${episodeId}/voicers/${voicerId}`, null);
  }

  // REMOVE podcast episode voicer
  removeEpisodeVoicer(id: number, episodeId: number, voicerId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/episodes/${episodeId}/voicers/${voicerId}`);
  }
}
