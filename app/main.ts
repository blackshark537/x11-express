
//  IMPORTS
import  fs               from 'fs';
import  vm               from 'vm';
import  http             from 'http';
import  cors             from 'cors';
import  debug            from 'debug';
import  winston          from 'winston';
import  expressWinston   from 'express-winston';
import  express, {
        Request, 
        Response, 
        NextFunction
} from 'express';
import { 
        connect 
} from 'mongoose';
import { 
        x11Controller 
} from './controllers/x11-controller.service';


//  INTERFACES
interface keyValue{ [name: string]: any }

export interface Node{
    id: number;
    name: string;
    class: string;
    html: string;
    data: keyValue;
    outputs: {
        [name: string]: {
            connections: {
                node: string
            }[]
        }
    };
    inputs: {
        [name: string]: {
            connections: {
                node: string
            }[]
        }
    }
}

// APP CONFIGURATION
const app: express.Application = express();
const server: http.Server = http.createServer(app);
const debugLog: debug.IDebugger = debug('app');

app.use(express.json());

// STATIC FILES FOLDER
app.use(express.static('public'));

// CORS PERMITION
app.use(cors());

// here we are preparing the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
const loggerOptions: expressWinston.LoggerOptions = {
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
            winston.format.json(),
            winston.format.prettyPrint(),
            winston.format.colorize({ all: true })
    ),
};

// when not debugging, log requests as one-liners
if (!process.env.DEBUG) {
    loggerOptions.meta = false; 
}

// initialize the logger with the above configuration
app.use(expressWinston.logger(loggerOptions));

// GLOBAL VARIABLES
let port: number = 3000;
let Database: string = 'x11'
const runningMessage = `Server running at http://localhost:${port}`;

try {
    const file = fs.readFileSync('./app/app-config.json', {encoding: 'utf-8'});

    const dfSchema = JSON.parse(file);
    const modules = Object.keys(dfSchema) as string[];
    const AppConfig = (Object.values(dfSchema['Home']['data']) as Node[]).find(el=> el.name === 'app');

    port = AppConfig?.data['port'];
    Database = AppConfig?.data['database'];

    const Factory = ()=>{
        modules.forEach(module=>{
            const nodes: Node[] = Object.values(dfSchema[module].data);
            nodes.forEach(node=>{
                if(node.name === 'express'){
                    const route = '/'+ module + node.data.route;
                    const method = node.data.method;
                    debugLog(`Routes configured for ${route}`);
                    
                    const childs: string[] = node.outputs['output_1']['connections'].map(el=> el.node);
                    const controllerNode: Node = childs.map(node=> dfSchema[module]['data'][node]).find(node=> node.class === 'controller');
                    const middlewareNodes: Node[] = childs.map(node=> dfSchema[module]['data'][node]).filter(node=> node.class === 'middleware');
    
                    if(middlewareNodes.length){
                        middlewareNodes.map(middlewareNode=>{
                            try {
                                const middlewareCode = middlewareNode.data.code;
    
                                app.use(route, function(req,res, next){
                                    
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
    
                            const _app: any = app;
                            (_app[method])(route, (req: Request, res: Response, next: NextFunction)=>{
                                try {
                                    req.query['collection'] = collections[0];
                                    req.query['module'] = module;
                                    const controller: any = x11Controller.getInstance();
                                    controller[controllerNode.data.ctrl](req, res, next);
                                } catch (error) {
                                    console.error(error);
                                }
                            });
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            });
        });
    }

    //  DRAWFLOW MODEL HANDLE
    app.post('/model', (req, res)=>{
        fs.writeFileSync('./app/app-config.json', JSON.stringify(req.body));
        process.exit(1);
        //res.json({msg: 'Done!'});
    });

    app.get('/model', (req, res)=>{
        const f = fs.readFileSync('./app/app-config.json', {encoding: 'utf-8'});
        res.json(JSON.parse(f));
        res.end();
    });

    Factory();
} catch (error) {
    console.error("drawflow schema empty", error);
}

//  X11-APP
app.get('/x11', (req, res)=>{
    debugLog(`Routes configured for /x11`);
    const f = fs.readFileSync('./views/x11.html', {encoding: 'utf-8'});
    res.write(f);
    res.end();
});

// START SERVER
connect(`mongodb://localhost:27017/${Database}`, (error)=>{
    if(error){
        console.error(error);
        return;
    }
    console.log('MongoDB conected...');
    console.log('Database: '+Database);
    server.listen(port, () => {
        console.log(runningMessage);
    });
});