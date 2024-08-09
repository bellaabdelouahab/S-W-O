import { IUser } from '@root/interfaces/models/i_user';
import User from '@root/models/user/user_model';
import AppError from '@root/utils/app_error';
import AuthUtils from '@root/utils/authorization/auth_utils';
import * as express from 'express';

export async function expressAuthentication(
    req: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<IUser> {
    if (securityName !== 'jwt') {
        throw new AppError(
            401,
            'Unknown security type, Please contact the admin'
        );
    }

    try {
        const user = await validateAccessToken(req);
        req.user = user;

        if (
            scopes &&
            scopes.length > 0 &&
            !scopes.some((role) => user.roles.includes(role))
        ) {
            throw new AppError(403, 'You are not allowed to do this action');
        }

        return user;
    } catch (err) {
        handleAuthError(err);
    }
}

async function validateAccessToken(req: express.Request): Promise<IUser> {
    const accessToken =
        req.header('access_token') ||
        req.cookies?.access_token ||
        req.header('authorization')?.replace('Bearer ', '');

    if (!accessToken) {
        throw new AppError(
            401,
            'Access Token is required, Please login to continue'
        );
    }

    let accessTokenPayload;
    try {
        accessTokenPayload = await AuthUtils.verifyAccessToken(accessToken);
    } catch (err) {
        handleAuthError(err);
    }

    if (!accessTokenPayload || !accessTokenPayload._id) {
        throw new AppError(401, 'Invalid access token');
    }

    const user = await User.findById(accessTokenPayload._id)
        .select(
            'accessRestricted active roles authorities restrictions name email'
        )
        .lean();

    if (!user) {
        throw new AppError(401, 'This user no longer exists');
    }

    if (user.accessRestricted) {
        throw new AppError(
            403,
            'Your account has been banned. Please contact the admin for more information.'
        );
    }

    if (!user.active) {
        throw new AppError(
            403,
            'Your account is not active. Please activate your account to continue.'
        );
    }

    return user;
}

function handleAuthError(err: any): never {
    if (err.name === 'TokenExpiredError') {
        throw new AppError(401, 'Your token is expired');
    }
    if (err.name === 'JsonWebTokenError') {
        throw new AppError(401, err.message);
    }
    throw err;
}
