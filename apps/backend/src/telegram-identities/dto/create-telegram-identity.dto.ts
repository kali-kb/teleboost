import { IsString } from "class-validator";
export class CreateTelegramIdentityDto {

    @IsString()
    telegramId: string;

    @IsString()
    userName: string;

    @IsString()
    firstName: string;

}
