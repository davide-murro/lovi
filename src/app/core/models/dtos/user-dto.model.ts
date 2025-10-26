export interface UserDto {
    id: string;
    newPassword?: string;
    email: string;
    emailConfirmed?: boolean;
    name: string;
}
