import { CreatorDto } from "./creator-dto.model";
import { PodcastEpisodeDto } from "./podcast-episode-dto.model";

export interface PodcastDto {
    id?: number;
    name: string;
    coverImageUrl?: string;
    coverImage?: File;
    coverImagePreviewUrl?: string;
    coverImagePreview?: File;
    description?: string;
    episodes?: PodcastEpisodeDto[];
    voicers?: CreatorDto[];
}
