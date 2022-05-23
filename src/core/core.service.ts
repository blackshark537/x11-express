import  fs               from 'fs';
import express,{
    Request, 
    Response, 
    NextFunction
} from 'express';

import { ControllerModule } from '../controllers';
import { MiddlewareModule } from '../middlewares';
import { KeyValue, Node } from '../interfaces/';

export class CoreService{
    
    private app: express.Application;

    constructor(app: express.Application){
        this.app = app;
    }

    start(){
        try {
            const path = './app-config.json';
            const file = fs.readFileSync(path, {encoding: 'utf-8'});
            const dfSchema = JSON.parse(file);
            const modules: string[] = Object.keys(dfSchema);
            modules.forEach(module=>{
                const nodes: Node[] = Object.values(dfSchema[module].data);
                nodes.forEach(node=>{
                    if(node.name === 'express'){
                        const route = '/'+ module + node.data.route;
                        const method = node.data.method;
                        
                        const childs: string[] = node.outputs['output_1']['connections'].map(el=> el.node);
                        const controllerNode: Node = childs.map(node=> dfSchema[module]['data'][node]).find(node=> node.class === 'controller');
                        const middlewareNodes: Node[] = childs.map(node=> dfSchema[module]['data'][node]).filter(node=> node.class === 'middleware');
        
                        if(middlewareNodes.length){
                            middlewareNodes.map(middlewareNode=>{
                                try {
                                    const name = middlewareNode.data.name;
                                    const _middlewares: KeyValue = MiddlewareModule
                                    this.app.use(route, function(req,res, next){
                                        _middlewares[name](req, res, next);
                                    });
                                } catch (error) {
                                    console.error(error);
                                }
                            })
                        }
        
                        if(controllerNode){
                            try {
                                const collections: string[] = controllerNode.outputs['output_1']['connections'].map(el=> el.node);
                                const _app: KeyValue = this.app;
                                (_app[method])(route, (req: Request, res: Response, next: NextFunction)=>{
                                    try {
                                        const controller: KeyValue = ControllerModule;
                                        const name = controllerNode.data.name;
                                        const func = controllerNode.data.func;
                                        req.query['collection'] = collections[0];
                                        req.query['module'] = module;
                                        req.query['func'] = func
                                        console.log({name,func});
                                        controller[name](req, res, next);
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