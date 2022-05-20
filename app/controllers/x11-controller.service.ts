import { NextFunction, Request, Response } from 'express';
import { Model } from '../schemas/x11.model';
import * as fs from 'fs';
import { Node } from '../main';

export class x11Controller{
    
    private schema: any;
    static _instance: x11Controller;

    constructor(){
        //  LOAD SCHEMA
        try {
            const file = fs.readFileSync('./app/app-config.json', { encoding: 'utf-8'});
            this.schema = JSON.parse(file);
        } catch (error) {
            throw new Error(error as string);
        }
    }

    static getInstance(): x11Controller{
        if(!this._instance) this._instance = new x11Controller();
        return this._instance;
    }
    
    async findAll(req: Request, res: Response, next: NextFunction){
        try {
            const query = req.query as { 
                module: string;
                schema: string;
                collection: string;
                param?: {[name: string]: any};
                cond: string;
                numValue?: string;
                value?: string;
                filters?: any;
            };
            const module = this.schema[query['module']].data;
            const collection = module[query['collection']];
    
            if(query.param){
                const { numValue, cond, value } = query;
                const _value = numValue? parseInt(numValue) : value;
                query.param[cond] = _value
            }
            const resp = await Model.find({_collection: collection.data.schema})
            .where(query? {...query.filters, ...query.param} : {});
            res.json([
               ...resp
            ]);
        } catch (error) {
            this.showError(res, error);
        }
    }

    findOne = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const query: any = req.query['filters'];
            const resp = await Model.findOne({_id: req.params.id})
            .where(query? {...query} : {});
            res.json(
                ...resp
            );
        } catch (error) {
            this.showError(res, error);
        }
    }

    create = async(req: Request, res: Response, next: NextFunction)=>{
        try {

            const query = req.query as { 
                module: string; 
                schema: string;
                collection: string;
                param?: {[name: string]: any};
                cond: string;
                numValue?: string;
                value?: string;
                filters?: any;
            };
            const _module = this.schema[query['module']].data;
            const _schema: Node = _module[query['schema']];
            const body = req.body;
            const prop_nodes: string[] = _schema['outputs']['output_1'].connections.map(el=> el.node);
            const _collectionName = _schema['data']['schema'];
            const data: any = {};
    
            prop_nodes.forEach(node=>{
                const prop = _module[node];
                const data_node = prop.data;
                if(typeof(body[data_node['name']]) != data_node['type']){
                    throw Error(data_node['name'] + " value type is not "+ data_node['type']);
               }
                data[data_node['name']] = this.format(data_node, body);
            });
            
            const newModel = new Model({
                _collection: _collectionName,
                data: data
            });
            const result = await newModel.save();
            res.json(result);
    
        } catch (error) {
            this.showError(res, error);
        }
    }

    update = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            req.body.updatedAt = new Date();
            const result = await Model.findOneAndUpdate({_id: req.params.id}, req.body);
            res.json({result});
        } catch (error) {
            this.showError(res, error);
        }
    }

    del = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const result = await Model.findOneAndDelete({_id: req.params.id});
            res.json({result});
        } catch (error) {
            this.showError(res, error);
        }
    }

    dropCollection = async(req: Request, res: Response, next: NextFunction)=>{
        try {
            const query = req.query as { 
                module: string; 
                schema: string;
                collection: string;
                param?: {[name: string]: any};
                cond: string;
                numValue?: string;
                value?: string;
                filters?: any;
            };
            const _module = this.schema[query['module']].data;
            const _schema = _module[query['schema']];
            const _collectionName = _schema['data']['schema'];
            const result = await Model.deleteMany({_collection: _collectionName});
            res.json(result);
        } catch (error) {
            this.showError(res, error);
        }
    
    }

    format = (node: {[name: string]: any}, body: any)=>{
        if( node['type'] === 'date')
            return new Date(body[node['name']]);        
        return body[node['name']];
    }

    showError = async(res: Response, error: any)=>{
        res.status(500);
        res.json({
            msg: 'Server Error',
            error: error['message'],
            status: 500,
        });
    }
}