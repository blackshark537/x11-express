import { NextFunction, Request, Response } from 'express';
import { Crypto, File } from '../services'
import { x11ModelsModule } from '../models'
import { CustomModelsModule } from '../../app/models';

import { 
    HttpCode, 
    iQuery, 
    KeyNode, 
    KeyValue, 
    iNode, 
    PropTypes 
} from '../interfaces/x11.interface';

const Models = x11ModelsModule;

export class x11Controller{
    
    private appConfig: KeyValue;
    static _instance: x11Controller;

    private constructor(){
        //  LOAD APP CONFIG
        try {
            const file = File.read('./app-config.json');
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
            const collectionNode: iNode = module[query['collection']];
            const collection: string = collectionNode.data.schema;
            const type: string = collectionNode.data.type;
            const _Model = type === 'x11'? Models : CustomModelsModule; 

            const resp = await _Model[collection].find()
            .where(query? {...query.filters } : {});
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
            const collectionNode: iNode = module[query['collection']];
            const collection: string = collectionNode.data.schema;
            const type: string = collectionNode.data.type;

            const _Model = type === 'x11'? Models : CustomModelsModule; 

            //  CONDITIONAL FILTERING
            const _filter: KeyValue = {}
            const { filter,cond, value } = query;
            if( filter ){
                _filter[filter] = {};
                _filter[filter][cond] = value.includes(".")? parseFloat(value) : parseInt(value);
            }

            const resp = await _Model[collection].findOne({_id: req.params.id})
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
            const collectionNode: iNode = module[query['collection']];
            const collection: string = collectionNode.data.schema;
            const type: string = collectionNode.data.type;
            
            if(type === 'x11'){
                const body: KeyValue = req.body;
                const data: KeyValue = {};

                const prop_nodes: string[] = collectionNode.outputs['output_1'].connections.map(el=> el.node);
                
                prop_nodes.forEach(node=>{
                    const propNode: iNode = module[node];
                    const data_node: KeyValue = propNode.data;
                    data[data_node['name']] = this.parseDefaultValues(data_node, body);
                    this.checkType(data_node, body);
                    data[data_node['name']] = this.format(data_node, body);
                });
                const newModel = new Models[collection]({
                    data: data
                });
                const result = newModel//await newModel.save();
                res.json(result);
            } else {
                const newModel = new CustomModelsModule[collection]({
                    ...req.body
                });
                const result = await newModel.save();
                res.json(result);
            }
        } catch (error) {
            this.showError(res, error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const query: iQuery | any = req.query;
            const module: KeyNode = this.appConfig[query['module']].data;
            const collectionNode: iNode = module[query['collection']];
            const collection = collectionNode.data.schema;
            const type: string = collectionNode.data.type;

            const _Model = type === 'x11'? Models : CustomModelsModule; 

            req.body.updatedAt = new Date();
            const result = await _Model[collection].findOneAndUpdate({_id: req.params.id}, req.body);
            res.json({result});
        } catch (error) {
            this.showError(res, error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction){
        try {
            const query: iQuery | any = req.query;
            const module: KeyNode = this.appConfig[query['module']].data;
            const collectionNode: iNode = module[query['collection']];
            const collection = collectionNode.data.schema;
            const type: string = collectionNode.data.type;

            const _Model = type === 'x11'? Models : CustomModelsModule; 

            const result = await _Model[collection].findOneAndDelete({_id: req.params.id});
            res.json({result});
        } catch (error) {
            this.showError(res, error);
        }
    }

    async dropCollection(req: Request, res: Response, next: NextFunction) {
        try {
            const query: iQuery | any = req.query;
            const module: KeyNode = this.appConfig[query['module']].data;
            const collectionNode: iNode = module[query['collection']];
            const collection = collectionNode.data.schema;
            const type: string = collectionNode.data.type;

            const _Model = type === 'x11'? Models : CustomModelsModule; 

            const result = await _Model[collection].deleteMany({...query});
            res.json(result);
        } catch (error) {
            this.showError(res, error);
        }
    
    }

    private format(node: KeyValue, body: KeyValue): string | Date {
        if(!body[node['name']]) return body[node['name']];
        if( node['type'] === PropTypes.STRING)
            return body[node['name']].toLowerCase();
        if( node['type'] === PropTypes.DATE)
            return new Date(body[node['name']]);
        if( node['type'] === PropTypes.ENCRYPTED)
            return Crypto.encrypt(body[node['name']]);

        return body[node['name']];
    }

    private checkType(node: KeyValue, body: KeyValue): void{
        if(node['required']==='no') return;
        if(typeof(body[node['name']]) != node['type']){
            throw Error(node['name'] + " value type is not "+ node['type']);
        }
        return;
    }

    private parseDefaultValues(node: KeyValue, body: KeyValue): any{
        console.log(node, body)
        
        if(!node['default'] || body[node['name']] ) return body[node['name']];

        switch (node['type']) {
            case PropTypes.NUMBER:
                body[node['name']] = parseFloat(node['default']);
                break;
            case PropTypes.DATE:
                body[node['name']] = new Date(node['default']);
                break;
            case PropTypes.BOOLEAN:
                body[node['name']] = node['default'].includes('true')? true : false;
                break;
            default:
                break;
        }
        return body[node['name']];
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