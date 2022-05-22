import fs from 'fs';

import  express, {
    Request, 
    Response, 
    NextFunction
} from 'express';
import { HttpCode } from '../models';
import { Models } from '../models/x11.model';
import { Middlewares } from '../middlewares';

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
            fs.writeFileSync('./src/app-config.json', JSON.stringify(req.body));
            process.exit(1);
        });

        //  GET MODEL
        this.app.route('/model').get( (req: Request, res: Response, next: NextFunction)=>{
            const f = fs.readFileSync('./src/app-config.json', {encoding: 'utf-8'});
            res.json(JSON.parse(f));
            res.end();
        });

        // MIDDLEWARES ROUTES
        this.app.route('/middlewares').get((req: Request, res: Response, next: NextFunction)=>{
            const middlewares = Object.keys(Middlewares);
            res.json({middlewares});
        });

        this.app.route('/middlewares/new').post((req: Request, res: Response, next: NextFunction)=>{
            try {
                const middleware = req.body.name;
                const code = req.body.code;
                const path = "./src/middlewares/middleware.service.ts";

                const file = fs.readFileSync(path, {encoding: 'utf-8'});
                
                if(file.includes(middleware)){ 
                    res.status(HttpCode.CONFLICT).json({msg: "Middleware already exist."});
                    return;
                }

                const strs = file.split("= {");
                const newFile = [strs[0], `= { \n"${middleware}" : ${code},`, strs[1]].join("");
                fs.writeFileSync(path, newFile, {encoding: 'utf-8'});
                res.json({middleware, msg: "created"});

            } catch (error) {
                this.showError(res, error);
            }
        });

        // COLLECTIONS ROUTES
        this.app.route('/collections').get((req: Request, res: Response, next: NextFunction)=>{
            const collections = Object.keys(Models);
            res.json({collections});
        });

        this.app.route('/collections/new').post((req: Request, res: Response, next: NextFunction)=>{
            try {
                const collection = req.body.collection;
                const file = fs.readFileSync('./src/models/x11.model.ts', {encoding: 'utf-8'});
                
                if(file.includes(collection)){ 
                    res.status(HttpCode.CONFLICT).json({msg: "Collection already exist."});
                    return;
                }

                const strs = file.split("= {");
                const newFile = [strs[0], `= {\n'${collection}': model('${collection}', dataSchema),`, strs[1]].join("");
                fs.writeFileSync('./src/models/x11.model.ts', newFile, {encoding: 'utf-8'});
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