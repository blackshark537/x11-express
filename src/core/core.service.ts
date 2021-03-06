import express,{
    Request, 
    Response, 
    NextFunction
} from 'express';

import  { File } from './services';
import { ControllerModule } from './controllers';
import { CustomMiddlewaresModule } from '../app/middlewares';
import {x11MiddlewareModule} from './middlewares';
import { KeyValue, iNode } from './interfaces';

export class CoreService{
    
    private app: KeyValue;

    constructor(app: express.Application){
        this.app = app;
    }

    compile(){
        try {
            const path = './app-config.json';
            const file = File.read(path);
            const dfSchema = JSON.parse(file);
            const modules: string[] = Object.keys(dfSchema);
            
            modules.forEach(module=>{
                const nodes: iNode[] = Object.values(dfSchema[module].data);
                nodes.forEach(node=>{
                    if(node.name === 'express'){
                        const route = module === '/'? module : '/'+ module + node.data.route;
                        const method = node.data.method;

                        const childs: string[] = node.outputs['output_1']['connections'].map(el=> el.node);
                        const controllerNode: iNode = childs.map(child=> dfSchema[module]['data'][child]).find(_node=> _node.class === 'controller');
                        const middlewareNode: iNode = childs.map(child=> dfSchema[module]['data'][child]).find(_node=> _node.class === 'middleware');
                        const x11MiddlewareNode: iNode = childs.map(child=> dfSchema[module]['data'][child]).find(_node=> _node.class === 'x11-Mid');
                        const middlewareNodes: iNode[] = [];

                        //BFS
                        if(middlewareNode || x11MiddlewareNode ){
                        
                            let queue = [];

                            if(middlewareNode) queue.push(middlewareNode.id);
                            if(x11MiddlewareNode) queue.push(x11MiddlewareNode.id);

                            const visited = new Set();

                            while(queue.length){
                                const id: number = <number>queue.shift();
                                if(visited.has(id)) continue;
                                visited.add(id);
                                const _node: iNode = dfSchema[module]['data'][id];
                                middlewareNodes.push(_node);
                                const neighbors: string[] = _node.outputs['output_1']? _node.outputs['output_1']['connections'].map(el=> el.node) : [];
                                queue.push(...neighbors.map(el => parseInt(el)));
                            }
                        }

                        //let middlewareFunctions: Function[] = [];

                        if(middlewareNodes.length){

                            middlewareNodes.map(middlewareNode=>{
                                try {
                                    const path = middlewareNode.data.path;
                                    const compare = middlewareNode.data.compare;
                                    const name = middlewareNode.data.name;
                                    const type = middlewareNode.data.type;
                                    /* if(type==='custom'){
                                        middlewareFunctions.push(CustomMiddlewaresModule[name]);
                                    } else {
                                        middlewareFunctions.push(x11MiddlewareModule[name]);
                                    } */
                                    this.app[method](route, (req: Request, res: Response, next: NextFunction)=>{
                                        
                                        if(type==='custom'){
                                            CustomMiddlewaresModule[name](req, res, next);
                                        } else {
                                            req.query.path = path;
                                            req.query.compare = compare;
                                            x11MiddlewareModule[name](req, res, next);
                                        }
                                        
                                    });
                                } catch (error) {
                                    throw new Error(`${error}`);
                                }
                            })
                        }
                        
                        if(controllerNode){
                            try {
                                const collections: string[] = controllerNode.outputs['output_1']['connections'].map(el=> el.node);
                                
                                (this.app[method])(route ,(req: Request, res: Response, next: NextFunction)=>{
                                    try {

                                        const name = controllerNode.data.name;
                                        const _function = controllerNode.data.func;

                                        req.query['collection'] = collections[0];
                                        req.query['module'] = module;
                                        req.query['_function'] = _function;

                                        ControllerModule[name](req, res, next);
                                        
                                    } catch (error) {
                                        throw new Error(`${error}`);
                                    }
                                });
                            } catch (error) {
                                throw new Error(`${error}`);
                            }
                        }
                    }
                });
            });
        } catch (error) {
            throw new Error(`${error}`);
        }
    }
}