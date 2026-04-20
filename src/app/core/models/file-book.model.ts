export interface FileBook {
  id?: number;
  title: string;
  subtitle?: string;
  authors?: string[];
  fileSrc: string;
  coverImageSrc?: string;
  referenceLink: string;
}