import AppError from '@utils/app_error';
import Calendar from '@models/calendar/calendar_model';

export async function getCalendar(calendarid: string) {
    if (!calendarid) {
        throw new AppError(400, 'Calendar id is required');
    }
    const calendar = await Calendar.findById(calendarid);
    if (!calendar) {
        throw new AppError(404, 'Calendar not found with that id');
    }
    return calendar;
}
