
//  IMPORTS
import  fs               from 'fs';
import  http             from 'http';
import  cors             from 'cors';
import  debug            from 'debug';
import  winston          from 'winston';
import  expressWinston   from 'express-winston';

import 'dotenv/config'
import { AppRoutes } from './routes';
import  express from 'express';
import { connect } from 'mongoose';
import { Node } from './models';
import { CoreService } from './core';

// APP CONFIGURATION
const app: express.Application = express();
const server: http.Server = http.createServer(app);
//const debugLog: debug.IDebugger = debug('app');

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

const debugLog: debug.IDebugger = debug('app');

// when not debugging, log requests as one-liners
if (!process.env.DEBUG) {
    loggerOptions.meta = false; 
}

// initialize the logger with the above configuration
app.use(expressWinston.logger(loggerOptions));
app.set("port", process.env.PORT || 4200);
app.set("db", process.env.DB  || "x11-Express");

// App PORT and DB configutation
try {
    const file = fs.readFileSync('./app/app-config.json', {encoding: 'utf-8'});
    const dfSchema = JSON.parse(file);
    const AppConfig = (Object.values(dfSchema['Home']['data']) as Node[]).find(el=> el.name === 'app');

    if (AppConfig?.data) { 
        let envFile = fs.readFileSync('.env', {encoding: 'utf-8'});
        /* envFile = envFile.replace(/PORT=\d[0-9]{3}/g, `PORT=${AppConfig?.data['port']}`);
        envFile = envFile.replace(/DB=\w+/, `DB=${AppConfig?.data['database']}`); */
        fs.writeFileSync(".env", envFile, {encoding: 'utf-8'});

        app.set("port", process.env.PORT || 4200);
        app.set("db", process.env.DB  || "x11-Express");
    }
} catch (error) {
    throw new Error(`${error}`);
}

const appRoutes = new AppRoutes(app);
appRoutes.configureRoutes();

const core = new CoreService(app);
core.start();

// START SERVER
connect(`mongodb://localhost:27017/${app.get("db")}`, (error)=>{
    if(error) throw new Error(`${error}`);
    
    console.log('MongoDB conected...');

    const runningMessage = `Server running at http://localhost:${app.get("port")}`;
    
    debugLog(`${runningMessage}`);

    server.listen(app.get("port"), () => {
        console.log(runningMessage);
    });
});