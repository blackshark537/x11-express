import { model } from 'mongoose';
import { KeyValue } from '../interfaces';
import { dataSchema } from './schemas/x11.schema';

export const x11ModelsModule: KeyValue = {
'customers': model('customers', dataSchema),
}