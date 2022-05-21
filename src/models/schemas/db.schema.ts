import { Schema } from 'mongoose';

export const dataSchema = new Schema({
    data: {},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});