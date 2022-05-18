'use stric'
//const { exec } = require('child_process');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const vm = require('vm');
const cors = require('cors')

const controller = require('./src/controller/controller');

const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// cors
app.use(cors());

// Public Folder
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

// defaul variables
const port = 3000;
const Database = 'x11';

try {
    const file = fs.readFileSync('schema.json');
    const config = JSON.parse(file) | {};
    const modules = Object.keys(config);
    const cfNode = Object.values(config['Home']['data']).find(el=> el.name === 'app');
    port = cfNode['data']['port'];
    Database = cfNode['data']['mongoUri'];

    modules.forEach(m=>{
    const nodes = Object.values(config[m].data);
    nodes.forEach(n=>{
        if(n.name === 'express'){
            const _nodes = n.outputs['output_1']['connections'].map(el=> el.node);
            const route = '/'+ m + n.data.route;
            const method = n.data.method;
            const _ctrl = _nodes.map(node=> config[m]['data'][node]).find(node=> node.class === 'controller');
            const _mid = _nodes.map(node=> config[m]['data'][node]).find(node=> node.class === 'middleware');
    
            if(_mid){
                try {
                    const middlewareCode = _mid.data.code;
                    app.use(route, function(req,res, next){
                        const context = vm.createContext({
                            req, res, next,
                            logs: [],
                            file: {
                                name: "",
                                data: []
                            },
                        });
                        vm.runInContext(middlewareCode, context);
                        const { logs, file } = context;
                        logs.map(log => console.log(log));
                        
                        if(!file) return;

                        file.data.map(data=>{
                            fs.appendFileSync(file.name, JSON.stringify(data))
                            console.log(file.name, data);
                        });

                    });
                } catch (error) {
                    console.error(error);
                }
            }
    
            if(_ctrl){
    
                const _schema = _ctrl.outputs['output_1']['connections'].map(el=> el.node);
    
                try {
                    app[method](route, (req, res)=>{
                        try {
                            req.query['schema'] = _schema[0];
                            req.query['module'] = m;
                            controller[_ctrl.data.ctrl](req, res);
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
    console.error("drawflow schema error");
}

app.post('/model', (req, res)=>{
    fs.writeFileSync('schema.json', JSON.stringify(req.body));
    res.json({msg: 'Done!'});
});

app.get('/model', (req, res)=>{
  const f = fs.readFileSync('schema.json', {encoding: 'utf-8'});
  res.json(JSON.parse(f));
  res.end();
});

app.get('/x11', (req, res)=>{
    const f = fs.readFileSync('./public/index.html');
    res.write(f);
    res.end();
});

mongoose.connect(`mongodb://localhost:27017/${Database}`, (error)=>{
    if(error){
        console.error(error);
        return;
    }
    console.log('MongoDB conected...');
    console.log('Database: '+Database);
    app.listen(port, async()=>{ 
        console.log('x11-Express has started');
        console.log(`Go to http://localhost:${port}/x11`);
    });
});