const model = require('../model/model');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('schema.json'));

const findAll = async (req, res)=>{
    try {
        const _module = config[req.query['module']].data;
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
        const resp = await model.find({table: _schema.data.schema})
        .where(q? {...q['filters'], ...q['filter']} : {});
        res.json([
            ...resp
        ]);
    } catch (error) {
        showError(res, error);
    }
}

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

const create = async (req, res)=>{
    try {
        const _module = config[req.query['module']].data;
        const _schema = _module[req.query['schema']];
        const body = req.body;
        const prop_nodes = _schema['outputs']['output_1'].connections.map(el=> el.node);
        const table_name = _schema['data']['schema'];
        data = {};
        prop_nodes.forEach(node=>{
            const prop = _module[node];
            const data_node = prop.data;
            data[data_node['name']] = format(data_node, body);
        });

        const newModel = new model({
            table: table_name,
            data: data
        });
        const result = await newModel.save();
        res.json({result});
    } catch (error) {
        showError(res, error);
    }
}

const update = async(req, res)=>{
    try {
        const result = await model.findOneAndUpdate({_id: req.params.id}, req.body);
        res.json({result});
    } catch (error) {
        showError(res, error);
    }
}

const del = async (req, res)=>{
    try {
        const result = await model.findOneAndDelete({_id: req.params.id});
        res.json({result});
    } catch (error) {
        showError(res, error);
    }
}

const format = (node, body)=>{
    switch (node['type']) {
        case 'date':
            return new Date(body[node['name']])
        default:
            return body[node['name']];
    }
}

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