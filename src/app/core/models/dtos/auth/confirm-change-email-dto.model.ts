export interface ConfirmChangeEmailDto {
    userId: string;
    newEmail: string;
    token: string;
}
