import { PodcastDto } from "./podcast-dto.model";

export interface PodcastEpisodeDto {
    id: string;
    number: number;
    name: string;
    coverImageUrl?: string;
    description?: string;
    podcast: PodcastDto;
}
