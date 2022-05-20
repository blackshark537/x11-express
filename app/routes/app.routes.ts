import fs from 'fs';

import  express, {
    Request, 
    Response, 
    NextFunction
} from 'express';

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
            fs.writeFileSync('./app/app-config.json', JSON.stringify(req.body));
            process.exit(1);
        });

        //  GET MODEL
        this.app.route('/model').get( (req: Request, res: Response, next: NextFunction)=>{
            const f = fs.readFileSync('./app/app-config.json', {encoding: 'utf-8'});
            res.json(JSON.parse(f));
            res.end();
        });

        //  ADD COLLECTION
        this.app.route('/collections/new').post((req: Request, res: Response, next: NextFunction)=>{
            try {
                const collection = req.body.collection;
                const file = fs.readFileSync('./app/models/x11.model.ts', {encoding: 'utf-8'});
                
                if(file.includes(collection)){ 
                    res.json({msg: "Collection already exist."});
                    return;
                }

                const strs = file.split("= {");
                const newFile = [strs[0], `= {\n'${collection}': model('${collection}', dataSchema),`, strs[1]].join("");
                fs.writeFileSync('./app/models/x11.model.ts', newFile, {encoding: 'utf-8'});
                res.json({collection, newFile});

            } catch (error) {
                throw new Error(`${error}`);
            }
        });
    }

}