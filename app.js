'use strict';

//  REQUIRE MODULES
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const vm = require('vm');
const cors = require('cors')
const bodyParser = require('body-parser');
const controller = require('./src/controller/controller');

//  EXPRESS INSTANCE
const app = express();

// DEFAULT VARIABLES
let port = 3000;
let Database = 'x11';

//  BODY-PARSE
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//  CORS
app.use(cors());

// PUBLIC FOLDER
const options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
      res.set('x-timestamp', Date.now())
    }
}

app.use(express.static('public', options))

//  X11 FACTORY
try {
    const file = fs.readFileSync('schema.json');

    const dfSchema = JSON.parse(file);
    const _modules = Object.keys(dfSchema);
    const _app = Object.values(dfSchema['Home']['data']).find(el=> el.name === 'app');

    port = _app['data']['port'];
    Database = _app['data']['database'];

    _modules.forEach(module=>{
        const nodes = Object.values(dfSchema[module].data);
        nodes.forEach(node=>{
            if(node.name === 'express'){
                const route = '/'+ module + node.data.route;
                const method = node.data.method;

                const _nodes = node.outputs['output_1']['connections'].map(el=> el.node);
                const _ctrl = _nodes.map(node=> dfSchema[module]['data'][node]).find(node=> node.class === 'controller');
                const _middleware = _nodes.map(node=> dfSchema[module]['data'][node]).find(node=> node.class === 'middleware');
        
                if(_middleware){
                    try {
                        const middlewareCode = _middleware.data.code;
                        app.use(route, function(req,res, next){
                            
                            //  VIRTUAL CONTEXT
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
                            
                            const { logs, file } = context;

                            logs.map(log => console.log(log));
                            
                            if(!file) return;

                            file.data.map(data=>{
                                fs.appendFileSync(file.name, JSON.stringify(data));
                            });

                        });
                    } catch (error) {
                        console.error(error);
                    }
                }
        
                if(_ctrl){
                    try {
                        console.log("Route: " + method, route);
                        const _schema = _ctrl.outputs['output_1']['connections'].map(el=> el.node);
                        app[method](route, (req, res, next)=>{
                            try {
                                req.query['schema'] = _schema[0];
                                req.query['module'] = module;
                                controller[_ctrl.data.ctrl](req, res, next);
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
} catch (error) {
    console.error("drawflow schema empty", error);
}

//  DRAWFLOW MODEL HANDLE
app.post('/model', (req, res)=>{
    fs.writeFileSync('schema.json', JSON.stringify(req.body));
    res.json({msg: 'Done!'});
});

app.get('/model', (req, res)=>{
  const f = fs.readFileSync('schema.json', {encoding: 'utf-8'});
  res.json(JSON.parse(f));
  res.end();
});

//  X11-APP
app.get('/x11', (req, res)=>{
    const f = fs.readFileSync('./public/index.html');
    res.write(f);
    res.end();
});

//  MONGOOSE INIT
try {
    mongoose.connect(`mongodb://localhost:27017/${Database}`, (error)=>{
        if(error){
            console.error(error);
            return;
        }
        console.log('MongoDB conected...');
        console.log('Database: '+Database);

        //  APP INIT
        app.listen(port, async()=>{ 
            console.log('x11-Express has started');
            console.log(`Go to http://localhost:${port}/x11`);
        });
    });
} catch (error) {
    throw new Error(error);
}