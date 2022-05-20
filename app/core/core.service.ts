import  vm               from 'vm';
import  fs               from 'fs';
import express,{
    Request, 
    Response, 
    NextFunction
} from 'express';

import { 
    x11Controller 
} from '../controllers';
import { Node } from '../models';

export class CoreService{
    
    private app: express.Application;

    constructor(app: express.Application){
        this.app = app;
    }

    start(){
        try {
            const file = fs.readFileSync('./app/app-config.json', {encoding: 'utf-8'});
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
                                    const middlewareCode = middlewareNode.data.code;
        
                                    this.app.use(route, function(req,res, next){
                                        
                                        //  VM CONTEXT
                                        const context = vm.createContext({
                                            req, res, next,
                                            logs: [],
                                            file: {
                                                name: "",
                                                data: []
                                            },
                                        });
            
                                        //  V8 VIRTUAL MACHINE
                                        vm.runInContext(middlewareCode, context);
                                        
                                        const { logs, file } = context as {
                                            logs: any[],
                                            file: {
                                                name: string;
                                                data: any[];
                                            }
                                        };
            
                                        logs.map(log => console.log(log));
                                        
                                        if(!file) return;
            
                                        file.data.map(data=>{
                                            fs.appendFileSync(file.name, JSON.stringify(data));
                                        });
            
                                    });
                                } catch (error) {
                                    console.error(error);
                                }
                            })
                        }
        
                        if(controllerNode){
                            try {
                                const collections: string[] = controllerNode.outputs['output_1']['connections'].map(el=> el.node);
        
                                const _app: any = this.app;
                                (_app[method])(route, (req: Request, res: Response, next: NextFunction)=>{
                                    try {
                                        req.query['collection'] = collections[0];
                                        req.query['module'] = module;
                                        const controller: any = x11Controller.getInstance();
                                        controller[controllerNode.data.ctrl](req, res, next);
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