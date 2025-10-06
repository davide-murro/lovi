import { AudioBookDto } from "./audio-book-dto.model";
import { PodcastDto } from "./podcast-dto.model";
import { PodcastEpisodeDto } from "./podcast-episode-dto.model";
import { UserDto } from "./user-dto.model";

export interface LibraryDto {
    id: number;
    user: UserDto;
    podcast?: PodcastDto;
    podcastEpisode?: PodcastEpisodeDto;
    audioBook?: AudioBookDto;
}
