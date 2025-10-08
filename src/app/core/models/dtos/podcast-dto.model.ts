import { PodcastEpisodeDto } from "./podcast-episode-dto.model";

export interface PodcastDto {
    id: number;
    name: string;
    coverImageUrl?: string;
    description?: string;
    episodes: PodcastEpisodeDto[];
    
    // only front end
    isInMyLibrary?: boolean;
}
