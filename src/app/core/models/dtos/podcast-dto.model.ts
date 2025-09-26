import { PodcastEpisodeDto } from "./podcast-episode-dto.model";

export interface PodcastDto {
    id: string;
    name: string;
    coverImageUrl?: string;
    description?: string;
    episodes: PodcastEpisodeDto[];
}
