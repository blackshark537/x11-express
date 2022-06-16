import { KeyValue } from '../core/interfaces';
import { model, Schema } from 'mongoose';

/* 
Example:
export const dataSchema = new Schema({
    fname: {type: String},
    lname: {type: String},
    email: {type: String},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
}); 
*/

export const CustomModelsModule: KeyValue = {
    /* 'customCustomers': model('custom-customers', dataSchema ), */
}