import { NextFunction, Request, Response } from 'express';
import { Cripto } from '../services'
import { HttpCode, iQuery, KeyNode, KeyValue, Models, Node, PropTypes } from '../models';
import * as fs from 'fs';

export class x11Controller{
    
    private appConfig: KeyValue;
    static _instance: x11Controller;

    private constructor(){
        //  LOAD APP CONFIG
        try {
            const file = fs.readFileSync('./src/app-config.json', { encoding: 'utf-8'});
            this.appConfig = JSON.parse(file);
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
            const query: iQuery | any = req.query;
            const module: KeyNode = this.appConfig[query['module']].data;
            const collectionNode: Node = module[query['collection']];
            const collection: string = collectionNode.data.schema;

            const _Models: KeyValue = Models;
            
            //  CONDITIONAL FILTERING
            const _filter: KeyValue = {}
            const { filter,cond, value } = query;
            if( filter ){
                _filter[filter] = {};
                _filter[filter][cond] = value.includes(".")? parseFloat(value) : parseInt(value);
            }
            
            const resp = await _Models[collection].find()
            .where(query? {...query.filters, ..._filter } : {});
            res.json([
               ...resp
            ]);

        } catch (error) {
            this.showError(res, error);
        }
    }

    async findOne(req: Request, res: Response, next: NextFunction){
        try {
            const query: iQuery | any = req.query;
            const module: KeyNode = this.appConfig[query['module']].data;
            const collectionNode: Node = module[query['collection']];
            const collection: string = collectionNode.data.schema;

            const _Models: KeyValue = Models;

            //  CONDITIONAL FILTERING
            const _filter: KeyValue = {}
            const { filter,cond, value } = query;
            if( filter ){
                _filter[filter] = {};
                _filter[filter][cond] = value.includes(".")? parseFloat(value) : parseInt(value);
            }

            const resp = await _Models[collection].findOne({_id: req.params.id})
            .where(query? {...query, ..._filter} : {});
            res.json(
                resp
            );

        } catch (error) {
            this.showError(res, error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction){
        try {

            const query: iQuery | any = req.query;
            const module: KeyNode = this.appConfig[query['module']].data;
            const collectionNode: Node = module[query['collection']];
            const collection: string = collectionNode.data.schema;

            const _Models: KeyValue = Models;
            
            const body: KeyValue = req.body;
            const data: KeyValue = {};

            const prop_nodes: string[] = collectionNode.outputs['output_1'].connections.map(el=> el.node);
            
            prop_nodes.forEach(node=>{
                const propNode: Node = module[node];
                const data_node: KeyValue = propNode.data;
                this.checkType(data_node, body);
                data[data_node['name']] = this.format(data_node, body);
            });
            
            const newModel = new _Models[collection]({
                data: data
            });
            const result = await newModel.save();
            res.json(result);
    
        } catch (error) {
            this.showError(res, error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const query: iQuery | any = req.query;
            const module: KeyNode = this.appConfig[query['module']].data;
            const collectionNode: Node = module[query['collection']];
            const collection = collectionNode.data.schema;

            const _Models: KeyValue = Models;

            req.body.updatedAt = new Date();
            const result = await _Models[collection].findOneAndUpdate({_id: req.params.id}, req.body);
            res.json({result});
        } catch (error) {
            this.showError(res, error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction){
        try {
            const query: iQuery | any = req.query;
            const module: KeyNode = this.appConfig[query['module']].data;
            const collectionNode: Node = module[query['collection']];
            const collection = collectionNode.data.schema;

            const _Models: KeyValue = Models;

            const result = await _Models[collection].findOneAndDelete({_id: req.params.id});
            res.json({result});
        } catch (error) {
            this.showError(res, error);
        }
    }

    async dropCollection(req: Request, res: Response, next: NextFunction) {
        try {
            const query: iQuery | any = req.query;
            const module: KeyNode = this.appConfig[query['module']].data;
            const collectionNode: Node = module[query['collection']];
            const collection = collectionNode.data.schema;

            const _Models: KeyValue = Models;

            const result = await _Models[collection].deleteMany({...query});
            res.json(result);
        } catch (error) {
            this.showError(res, error);
        }
    
    }

    private format = (node: KeyValue, body: KeyValue)=>{
        if( node['type'] === PropTypes.DATE)
            return new Date(body[node['name']]);
        if( node['type'] === PropTypes.ENCRYPTED)
            return Cripto.encript(body[node['name']]);

        return body[node['name']];
    }

    private checkType(data_node: KeyValue, body: KeyValue){
        if(typeof(body[data_node['name']]) != data_node['type']){
            throw Error(data_node['name'] + " value type is not "+ data_node['type']);
        }
        return;
    }

    private async showError(res: Response, error: any){
        res.status(HttpCode.SERVER_ERROR);
        res.json({
            msg: 'Server Error',
            error: error['message'],
            status:HttpCode.SERVER_ERROR,
        });
    }
}