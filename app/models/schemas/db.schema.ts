import { Schema } from 'mongoose';

export const dataSchema = new Schema({
    _collection: String,
    data: {},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});