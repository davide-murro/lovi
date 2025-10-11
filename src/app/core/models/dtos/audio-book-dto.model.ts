import { CreatorDto } from "./creator-dto.model";

export interface AudioBookDto {
    id: number;
    name: string;
    coverImageUrl?: string;
    description?: string;
    audioUrl: string;
    readers: CreatorDto[];
    
    // only front end
    isInMyLibrary?: boolean;

    isCurrentTrack?: boolean;
    isCurrentTrackPlaying?: boolean;
}
