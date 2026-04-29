import { CreatorDto } from "./creator-dto.model";

export interface BookDto {
    id?: number;
    name: string;
    dataUrl?: string;
    coverImageUrl?: string;
    coverImage?: File;
    coverImagePreviewUrl?: string;
    coverImagePreview?: File;
    description?: string;
    
    // Audio Book attributes
    audioUrl?: string;
    audio?: File;
    readers?: CreatorDto[];
    
    // EBook attributes
    fileUrl?: string;
    file?: File;
    writers?: CreatorDto[];
}
