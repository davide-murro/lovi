import { CreatorDto } from "./creator-dto.model";
import { PodcastDto } from "./podcast-dto.model";

export interface PodcastEpisodeDto {
    id?: number;
    number: number;
    name: string;
    coverImageUrl?: string;
    coverImage?: File;
    description?: string;
    audioUrl?: string;
    audio?: File;
    podcastId?: number;
    podcast?: PodcastDto;
    voicers?: CreatorDto[];

    // only front end
    isInMyLibrary?: boolean;

    isCurrentTrack?: boolean;
    isCurrentTrackPlaying?: boolean;
}
