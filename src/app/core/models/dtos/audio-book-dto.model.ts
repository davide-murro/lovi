import { CreatorDto } from "./creator-dto.model";

export interface AudioBookDto {
    id?: number;
    name: string;
    coverImageUrl?: string;
    coverImage?: File;
    description?: string;
    audioUrl?: string;
    audio?: File;
    readers?: CreatorDto[];
}
