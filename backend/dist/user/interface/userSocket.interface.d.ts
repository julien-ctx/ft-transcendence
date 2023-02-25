import { User } from "@prisma/client";
export interface UsersSocketInterface {
    user: User;
    client: any;
}
