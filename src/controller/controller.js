'use strict';
//  REQUIRE MODULES
const model = require('../model/model');
const fs = require('fs');

//  LOAD SCHEMA
const schema = JSON.parse(fs.readFileSync('schema.json'));

//  CONTROLLER FUNCTIONS
/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
const findAll = async (req, res)=>{
    try {
        const _module = schema[req.query['module']].data;
        const _schema = _module[req.query['schema']];

        const q = req.query;
        if(req.query['filter']){
            const value = req.query['numValue']? parseInt(req.query['numValue']) : req.query['value'];
            const cond = req.query['cond']? req.query['cond'] : '$eq';
            const key = req.query['filter'];
            q['filter'] = {}
            q['filter'][key]={}
            q['filter'][key][cond] = value;
        }
        const resp = await model.find({_collection: _schema.data.schema})
        .where(q? {...q['filters'], ...q['filter']} : {});
        res.json([
            ...resp
        ]);
    } catch (error) {
        showError(res, error);
    }
}

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
const findOne = async(req, res)=>{
    try {
        const q = req.query['filters'];
        const resp = await model.findOne({_id: req.params.id})
        .where(q? q : {});
        res.json(
            ...resp
        );
    } catch (error) {
        showError(res, error);
    }
}

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
const create = async (req, res)=>{
    try {
        const _module = schema[req.query['module']].data;
        const _schema = _module[req.query['schema']];
        const body = req.body;
        const prop_nodes = _schema['outputs']['output_1'].connections.map(el=> el.node);
        const _collectionName = _schema['data']['schema'];
        data = {};
        prop_nodes.forEach(node=>{
            const prop = _module[node];
            const data_node = prop.data;
            data[data_node['name']] = format(data_node, body);
        });

        const newModel = new model({
            _collection: _collectionName,
            data: data
        });
        const result = await newModel.save();
        res.json({result});
    } catch (error) {
        showError(res, error);
    }
}

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
const update = async(req, res)=>{
    try {
        req.body.updatedAt = new Date();
        const result = await model.findOneAndUpdate({_id: req.params.id}, req.body);
        res.json({result});
    } catch (error) {
        showError(res, error);
    }
}

/**
 * 
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 */
const del = async (req, res)=>{
    try {
        const result = await model.findOneAndDelete({_id: req.params.id});
        res.json({result});
    } catch (error) {
        showError(res, error);
    }
}

/**
 * 
 * @private
 * @param {DrawFlow.Node} node 
 * @param {any} body Data
 * @returns {Date} 
 */
const format = (node, body)=>{
    switch (node['type']) {
        case 'date':
            return new Date(body[node['name']])
        default:
            return body[node['name']];
    }
}

/**
 * @private
 * @param {Express.Response} res 
 * @param {Error} error 
 */
const showError = (res, error)=>{
    res.status(500);
    res.json({
        msg: 'Server Error',
        error: error['message'],
        status: 500,
    });
}

module.exports = {
    findAll,
    findOne,
    create,
    update,
    del
}