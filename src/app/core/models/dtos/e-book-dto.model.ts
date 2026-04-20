import { CreatorDto } from "./creator-dto.model";

export interface EBookDto {
    id?: number;
    name: string;
    dataUrl?: string;
    coverImageUrl?: string;
    coverImage?: File;
    coverImagePreviewUrl?: string;
    coverImagePreview?: File;
    description?: string;
    fileUrl?: string;
    file?: File;
    writers?: CreatorDto[];
}
