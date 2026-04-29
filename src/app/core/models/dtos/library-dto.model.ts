import { BookDto } from "./book-dto.model";
import { PodcastDto } from "./podcast-dto.model";
import { PodcastEpisodeDto } from "./podcast-episode-dto.model";
import { UserProfileDto } from "./user-profile-dto.model";

export interface LibraryDto {
    id?: number;
    user: UserProfileDto;
    podcast?: PodcastDto;
    podcastEpisode?: PodcastEpisodeDto;
    book?: BookDto;
}
