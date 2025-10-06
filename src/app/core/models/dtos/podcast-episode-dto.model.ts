import { PodcastDto } from "./podcast-dto.model";

export interface PodcastEpisodeDto {
    id: number;
    number: number;
    name: string;
    coverImageUrl?: string;
    description?: string;
    audioUrl: string;
    podcast: PodcastDto;

    // only front end
    isInMyLibrary?: boolean;

    isCurrentTrack?: boolean;
    isCurrentTrackPlaying?: boolean;
}
