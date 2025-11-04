export interface TokenInfoDto {
    id: string;
    userName: string;
    refreshToken: string;
    expiredAt: Date;
    refreshedAt: Date;
    deviceId: string;
}
