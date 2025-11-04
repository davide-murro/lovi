import { RoleDto } from "./role-dto.model";
import { TokenInfoDto } from "./token-info-dto.model";

export interface UserDto {
    id: string;
    newPassword?: string;
    email: string;
    emailConfirmed?: boolean;
    name: string;
    roles?: RoleDto[];
    tokenInfos?: TokenInfoDto[];
}
