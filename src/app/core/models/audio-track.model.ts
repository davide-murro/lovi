export interface AudioTrack {
  id: number;
  title: string;
  subtitle?: string;
  artists?: string[];
  audioSrc: string;
  coverImageSrc?: string;
  referenceLink: string;
}