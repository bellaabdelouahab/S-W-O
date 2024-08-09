import { Request } from 'express';
import User from '@models/user/user_model';
import AppError from '@root/utils/app_error';

export function InspectAuthority(...actions: string[]): MethodDecorator {
    return function (
        _target: Object,
        _propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            const req: Request = args[0];
            const next: Function = args[2];

            try {
                const user = await User.findById(req.user._id).lean();

                if (!user) {
                    throw new AppError(
                        401,
                        'The user belonging to this token does no longer exist'
                    );
                }

                if (!user.isAuthorizedTo(actions)) {
                    throw new AppError(
                        403,
                        `You do not have permission to perform this action; required permissions: ${actions}`
                    );
                }

                if (user.isRestrictedFrom(actions)) {
                    throw new AppError(
                        403,
                        'You are restricted from performing this action, contact the admin for more information'
                    );
                }

                await originalMethod.apply(this, args);
            } catch (error) {
                next(error);
            }
        };
        return descriptor;
    };
}
