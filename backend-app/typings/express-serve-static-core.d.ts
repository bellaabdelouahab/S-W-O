import { IUserRequest } from '@root/interfaces/models/i_user';
import { Express } from 'express-serve-static-core';
declare module 'express-serve-static-core' {
    interface Request {
        user: IUserRequest | undefined;
    }
}
