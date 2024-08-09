import mongoose, { Document } from 'mongoose';

export interface ICalendar extends Document {
    name: string;
    type: string;
    isPublic: boolean;
    isShareAble: boolean;
    participants: mongoose.Schema.Types.ObjectId[];
    events: mongoose.Schema.Types.ObjectId[];
    description?: string;
    accessCode?: string;
    tags: string[];
    allowedUsers: mongoose.Schema.Types.ObjectId[];
    deniedUsers: mongoose.Schema.Types.ObjectId[];
    deleted: boolean;
    deletedBy?: string;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;

}
