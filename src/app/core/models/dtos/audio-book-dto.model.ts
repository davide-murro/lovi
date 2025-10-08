export interface AudioBookDto {
    id: number;
    name: string;
    coverImageUrl?: string;
    description?: string;
    audioUrl: string;
    
    // only front end
    isInMyLibrary?: boolean;

    isCurrentTrack?: boolean;
    isCurrentTrackPlaying?: boolean;
}
