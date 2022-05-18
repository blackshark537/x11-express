const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataSchema = new Schema({
    _collection: String,
    data: {},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model('database', dataSchema);