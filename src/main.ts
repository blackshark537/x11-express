
//  IMPORTS
import  fs               from 'fs';
import  http             from 'http';
import  cors             from 'cors';
import  debug            from 'debug';
import  winston          from 'winston';
import  expressWinston   from 'express-winston';

import 'dotenv/config'

import  express         from 'express';
import { iNode }        from './core/interfaces';
import { connect }      from 'mongoose';
import { AppRoutes }    from './core/routes';
import { CoreService }  from './core';

const boolParser = require('express-query-boolean');
const intParser = require('express-query-int');

// APP CONFIGURATION
const app: express.Application = express();
const server: http.Server = http.createServer(app);
//const debugLog: debug.IDebugger = debug('app');

app.use(express.json());
app.use(boolParser());
app.use(intParser());
// STATIC FILES FOLDER
app.use(express.static('public'));

// LOGGIN MIDDLEWARE
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

// APP INIT
const debugLog: debug.IDebugger = debug('app');

app.use(expressWinston.logger(loggerOptions));
app.set("port", process.env.PORT || 3000);
app.set("db", process.env.DB  || "x11");

// App PORT and DB configutation
try {
    const path = './app-config.json';
    const file = fs.readFileSync(path, {encoding: 'utf-8'});
    const dfSchema = JSON.parse(file);
    const AppConfig = (Object.values(dfSchema['Settings']['data']) as iNode[]).find(el=> el.name === 'app');

    if (AppConfig?.data) { 
        // CORS PERMITION
        if(AppConfig.data['usecors'] === 'yes'){ 
            app.use(cors());
            console.log("app is using cors()");
        }

        let envFile = fs.readFileSync('.env', {encoding: 'utf-8'});
        envFile = envFile.replace(/PORT=\d[0-9]{3}/g, `PORT=${AppConfig?.data['port']}`);
        envFile = envFile.replace(/DB=\w+/, `DB=${AppConfig?.data['database']}`);
        
        fs.writeFileSync(".env", envFile, {encoding: 'utf-8'});

        app.set("port", process.env.PORT);
        app.set("db", process.env.DB);
    }
} catch (error) {
    throw new Error(`${error}`);
}

const appRoutes = new AppRoutes(app);
appRoutes.configureRoutes();

const core = new CoreService(app);
core.compile();

// START SERVER
connect(`mongodb://localhost:27017/${app.get("db")}`, (error)=>{
    if(error) throw new Error(`${error}`);
    

    const runningMessage = `
*****  MongoDB Conected  *****
*******************************************************************************
*
*   Author: Blackshark537
*   Host: localhost
*   Port: ${app.get("port")}
*   DB Name: ${app.get("db")}
*   Server running at http://localhost:${app.get("port")}
*   To start editing please visit http://localhost:${app.get("port")}/x11
*
*******************************************************************************`;
    
    debugLog(`${runningMessage}`);

    server.listen(app.get("port"), () => {
        console.log(runningMessage);
    });
});