import { model } from 'mongoose';
import { dataSchema } from './schemas/db.schema';

export const Models = {
'products': model('products', dataSchema),

}