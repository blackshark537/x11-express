import { model } from 'mongoose';
import { dataSchema } from './schemas/db.schema';

export const ModelModule = {
    'categories': model('categories', dataSchema),
    'products': model('products', dataSchema),
    'customers': model('customers', dataSchema),
}