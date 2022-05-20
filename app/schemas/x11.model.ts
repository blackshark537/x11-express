import { Schema, model } from 'mongoose';

export interface x11Model{
    _collection: string;
    data: any;
    createdAt: Date;
    updatedAt: Date;
}

const dataSchema = new Schema({
    _collection: String,
    data: {},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

export const Model = model('database', dataSchema);