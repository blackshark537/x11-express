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

        //  DRAWFLOW MODEL HANDLE
        this.app.post('/model', (req: Request, res: Response, next: NextFunction)=>{
            fs.writeFileSync('./app/app-config.json', JSON.stringify(req.body));
            process.exit(1); // RESET THE APP
        });

        this.app.get('/model', (req: Request, res: Response, next: NextFunction)=>{
            const f = fs.readFileSync('./app/app-config.json', {encoding: 'utf-8'});
            res.json(JSON.parse(f));
            res.end();
        });
    }

}