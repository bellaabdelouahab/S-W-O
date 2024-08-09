import {
    Controller,
    Post,
    Get,
    Route,
    Tags,
    Path,
    Request,
    Res,
    Body,
    TsoaResponse,
    Delete,
    Security,
} from 'tsoa';
import { IReq } from '@interfaces/vendors';
import AppError from '@utils/app_error';
import * as calendar_validators from './calendar_validators';
import { Response, SuccessResponse } from 'tsoa';
import Calendar from '@root/models/calendar/calendar_model';
import { createOne } from '@controllers/base_controller';
@Route('api/calendar')
@Security('jwt')
@Tags('Calendar')
export class CalendarController extends Controller {
    @Post('create')
    @SuccessResponse(201, 'Created')
    @Response(403, 'You are not allowed to create a calendar')
    public async createCalendar(
        @Request() req: IReq,
        @Res() res: TsoaResponse<201, void>,
        @Body() body?: any
    ): Promise<void> {
        try {
            // if user is active and not blocked
            if (!req.user.active) {
                throw new AppError(
                    403,
                    'You are not allowed to create a calendar'
                );
            }

            createOne(Calendar, body, req.user._id.toString());

            res(201);
        } catch (err) {
            this.setStatus(err.statusCode || 500);
            throw new Error(err.message);
        }
    }

    @Get('{calendarId}')
    @SuccessResponse(200, 'OK')
    @Response(403, 'You are not allowed to view the calendar')
    public async getCalendar(
        @Request() req: IReq,
        // calendaar id in params
        @Path() calendarId: string,
        @Res() res: TsoaResponse<200, any>
    ): Promise<void> {
        try {
            const calendar = await calendar_validators.getCalendar(calendarId);

            if (this.isUserAuthorized(req.user, calendar)) {
                return res(200, calendar);
            }

            if (this.isDeniedUser(req.user._id.toString(), calendar)) {
                throw new AppError(
                    403,
                    'You are not allowed to view the calendar'
                );
            }

            if (this.isAllowedUser(req.user._id.toString(), calendar)) {
                return this.handleAllowedUser(req, calendar, res);
            }

            if (!calendar.isPublic) {
                return this.handlePrivateCalendar(req, calendar, res);
            }
            res(200, calendar);
        } catch (err) {
            this.setStatus(err.statusCode || 500);
            throw new Error(err.message);
        }
    }

    @Post('{calendarId}/update')
    @Response(403, 'You are not allowed to update this calendar')
    @SuccessResponse(204, 'No Content')
    public async updateCalendar(
        @Request() req: IReq,
        @Path() calendarId: string,
        @Res() _res: TsoaResponse<204, void>,
        @Body() body?: any
    ): Promise<void> {
        try {
            const calendar = await calendar_validators.getCalendar(calendarId);
            // check if user is not admin nor the owner of the calendar
            if (
                calendar.createdBy !== req.user._id.toString() ||
                !req.user.roles.includes('ADMIN') ||
                !req.user.roles.includes('SUPER_ADMIN')
            ) {
                throw new AppError(
                    403,
                    'You are not allowed to update this calendar'
                );
            }
            // TODO: update calendar
        } catch (err) {
            this.setStatus(err.statusCode || 500);
            throw new Error(err.message);
        }
    }

    @Delete('{calendarId}/delete')
    @Response(403, 'You are not allowed to delete this calendar')
    @SuccessResponse(204, 'No Content')
    public async deleteCalendar(
        @Request() req: IReq,
        @Path() calendarId: string,
        @Res() _res: TsoaResponse<204, void>,
        @Body() body?: any
    ): Promise<void> {
        try {
            const calendar = await calendar_validators.getCalendar(calendarId);
            // check if user is not admin nor the owner of the calendar
            if (
                calendar.createdBy !== req.user._id.toString() ||
                !req.user.roles.includes('SUPER_ADMIN')
            ) {
                throw new AppError(
                    403,
                    'You are not allowed to delete this calendar'
                );
            }
            // TODO: delete calendar
        } catch (err) {
            this.setStatus(err.statusCode || 500);
            throw new Error(err.message);
        }
    }

    ///////////////////////////////////////////////////////////
    // PRIVATE FUNCTIONS
    ///////////////////////////////////////////////////////////

    private isUserAuthorized(user: any, calendar: any): boolean {
        return (
            user._id.toString() === calendar.createdBy ||
            user.roles.includes('ADMIN') ||
            user.roles.includes('SUPER_ADMIN')
        );
    }

    private isDeniedUser(userId: string, calendar: any): boolean {
        return calendar.deniedUsers.includes(userId);
    }

    private isAllowedUser(userId: string, calendar: any): boolean {
        return calendar.allowedUsers.includes(userId);
    }

    private handleAllowedUser(
        req: IReq,
        calendar: any,
        res: TsoaResponse<200, any>
    ): void {
        if (calendar.accessCode) {
            this.validateAccessCode(
                req.query.accessCode.toString(),
                calendar.accessCode
            );
        }
        return res(200, calendar);
    }

    private handlePrivateCalendar(
        req: IReq,
        calendar: any,
        res: TsoaResponse<200, any>
    ): void {
        if (calendar.accessCode) {
            this.validateAccessCode(
                req.query.accessCode.toString(),
                calendar.accessCode
            );
            return res(200, calendar);
        }

        if (this.isAllowedUser(req.user._id.toString(), calendar)) {
            return res(200, calendar);
        }

        throw new AppError(403, 'You are not allowed to view the calendar');
    }

    private validateAccessCode(providedCode: string, actualCode: string): void {
        if (providedCode !== actualCode) {
            throw new AppError(
                403,
                'You are not allowed to view the calendar, a valid access code is required'
            );
        }
    }
}
