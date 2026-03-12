export interface CreatorDto {
    id: number;
    nickname: string;
    name?: string;
    surname?: string;
    dataUrl?: string;
    coverImageUrl?: string;
    coverImage?: File;
    coverImagePreviewUrl?: string;
    coverImagePreview?: File;
}
