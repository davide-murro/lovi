import { PodcastEpisodeDto } from "./podcast-episode-dto.model";

export interface PodcastDto {
    id: number;
    nickname: string;
    name?: string;
    surname?: string;
}
