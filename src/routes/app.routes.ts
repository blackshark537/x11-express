import fs from 'fs';

import  express, {
    Request, 
    Response, 
    NextFunction
} from 'express';
import { HttpCode } from '../core/interfaces';
import { x11ModelsModule } from '../core/models';

import { CustomModelsModule } from '../models';
import { CustomMiddlewaresModule } from '../middlewares';

const configPath = './app-config.json';

export class AppRoutes{

    private app: express.Application;

    constructor(app: express.Application){
        this.app = app;
    }

    configureRoutes(){
        //  X11-APP
        this.app.route('/x11').get((req: Request, res: Response, next: NextFunction)=>{
            const f = fs.readFileSync('./views/x11.html', {encoding: 'utf-8'});
            res.write(f);
            res.end();
        });

        //  SAVE MODEL AND RESET THE APP
        this.app.route('/model').post((req: Request, res: Response, next: NextFunction)=>{
            fs.writeFileSync(configPath, JSON.stringify(req.body));
            res.json({msg: "Model saved!"});
            res.end();
        });

        //  GET MODEL
        this.app.route('/model').get( (req: Request, res: Response, next: NextFunction)=>{
            const f = fs.readFileSync(configPath, {encoding: 'utf-8'});
            res.json(JSON.parse(f));
            res.end();
        });

        // MIDDLEWARES MODULES
        this.app.route('/middlewares').get((req: Request, res: Response, next: NextFunction)=>{
            const middlewares = Object.keys(CustomMiddlewaresModule);
            res.json({middlewares});
        });

        this.app.route('/middleware/code/:key').get((req: Request, res: Response, next: NextFunction)=>{
            try {
                const key = req.params.key;
                const path = process.env.PRODUCTION? "./dist/middlewares/middleware.module.js" : "./src/middlewares/middleware.module.ts";
                const file = fs.readFileSync(path, {encoding: 'utf-8'});

                const div1 = file.trim().split(`"${key}":`);
                const div2 = div1[1].split('},');
                res.send(div2[0]+'\n}');
                res.end();
               
            } catch (error) {
                this.showError(res, error);
            }
        });

        // COLLECTIONS MODULES
        this.app.route('/collections').get((req: Request, res: Response, next: NextFunction)=>{
            const type = req.query.type;
            if(type=== 'x11'){
                const collections = Object.keys(x11ModelsModule);
                res.json({collections});
            } else {
                const collections = Object.keys(CustomModelsModule);
                res.json({collections});
            }
            
        });

        this.app.route('/collections/new').post((req: Request, res: Response, next: NextFunction)=>{
            try {
                const path = process.env.PRODUCTION? './dist/models/x11.model.js' : './src/models/x11.model.ts';
                const collection = req.body.collection;
                const file = fs.readFileSync(path, {encoding: 'utf-8'});
                
                if(file.includes(collection)){ 
                    res.status(HttpCode.CONFLICT).json({msg: "Collection already exist."});
                    return;
                }

                const strs = file.split("= {");
                const newFile = [strs[0], `= {\n'${collection}': model('${collection}', dataSchema),`, strs[1]].join("");
                fs.writeFileSync(path, newFile, {encoding: 'utf-8'});
                res.json({collection, msg: "created"});

            } catch (error) {
                this.showError(res, error);
            }
        });
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