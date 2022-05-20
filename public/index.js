'use strict';
//  DRAW FLOW
const id = document.getElementById("drawflow");
const editor = new Drawflow(id);
editor.reroute = true;
editor.zoom_min = 0.4;
editor.start();

//  LOAD MODULES
let modules = ['Home'];
presentModules();
//  EDITOR MODE BUTTONS
const lock = document.getElementById('lock');
const unlock = document.getElementById('unlock');
changeMode('edit');

//  SET EDITOR MODE : LOCK | UNLOCK
function changeMode(option) {
    editor.editor_mode = option;
    lock.style.display = option === 'edit'? 'block' : 'none';
    unlock.style.display = option === 'edit'? 'none' : 'block';
}

//  CODEMONACO
/* let _code = document.getElementById('code');
_code.value = `\tfunction middleware(req,res,next){\t\tnext();\n\t}\tmiddleware(req, res, next);`; */
const vscode = document.getElementById("vscode");


//  CODE MIRROR
const cm = CodeMirror.fromTextArea(_code, {
    lineNumbers: true,
    cantEdit: true,
    mode:  {
        name: "javascript",
        json: true
    }
});

//  MOBILE CONFIG
var elements = document.getElementsByClassName('drag-drawflow');
for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('touchend', drop, false);
    elements[i].addEventListener('touchmove', positionMobile, false);
    elements[i].addEventListener('touchstart', drag, false);
}

var mobile_item_selec = '';
var mobile_last_move = null;
function positionMobile(ev) {
    mobile_last_move = ev;
}

//  EVENTS
editor.on('nodeCreated', function (id) {
    console.log("Node created " + id);
})

editor.on('nodeRemoved', function (id) {
    console.log("Node removed " + id);
})

editor.on('nodeSelected', function (id) {
    console.log("Node selected " + id);
})

editor.on('moduleCreated', function (name) {
    console.log("Module Created " + name);
})

editor.on('moduleChanged', function (name) {
    console.log("Module Changed " + name);
})

editor.on('connectionCreated', function (connection) {
    console.log('Connection created');
    console.log(connection);
})

editor.on('connectionRemoved', function (connection) {
    console.log('Connection removed');
    console.log(connection);
})

editor.on('mouseMove', function (position) {
    console.log('Position mouse x:' + position.x + ' y:' + position.y);
})

editor.on('nodeMoved', function (id) {
    console.log("Node moved " + id);
})

editor.on('zoom', function (zoom) {
    console.log('Zoom level ' + zoom);
})

editor.on('translate', function (position) {
    console.log('Translate x:' + position.x + ' y:' + position.y);
})

editor.on('addReroute', function (id) {
    console.log("Reroute added " + id);
})

editor.on('removeReroute', function (id) {
    console.log("Reroute removed " + id);
})



//  DRAG AND DROP
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    if (ev.type === "touchstart") {
        mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute('data-node');
    } else {
        ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
    }
}

function drop(ev) {
    if (ev.type === "touchend") {
        const parentdrawflow = document.elementFromPoint(mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY).closest("#drawflow");
        if (parentdrawflow != null) {
            addNodeToDrawFlow(mobile_item_selec, mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY);
        }
        mobile_item_selec = '';
    } else {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("node");
        addNodeToDrawFlow(data, ev.clientX, ev.clientY);
    }
}

//  NODE FACTORY
function addNodeToDrawFlow(name, pos_x, pos_y) {
    if(editor.editor_mode === 'fixed') {
        return false;
    }
    pos_x = pos_x * ( editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * ( editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
    pos_y = pos_y * ( editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * ( editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)));

    const nodeTypes = {
        "app": (x,y)=> addApp(x,y),
        "express": (x,y)=> addExpress(x,y),
        "controller":(x,y)=> addController(x,y),
        "middleware": (x,y)=> addMiddleware(x,y),
        "schema": (x,y)=> addScheme(x,y),
        "prop": (x,y)=> addProp(x,y),
    }
    
    nodeTypes[name](pos_x, pos_y);
}

//  NODES TYPES DEFINITION
function addApp(x,y){
    const data = { "port": 3000, "database": "x11-Express"};
    const app = `<div class="card m-0" style="width: 18rem;">
  <div class="card-header">
    @App Configuration
  </div>
  <div class="card-body">
    <div class="row">
        <div class="col">
            <label for="port" class="form-label">App Port</label>
            <input class="form-control" id="port" name="port" placeholder="App Port ie: 3000 " type="text" df-port>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <label for="uri" class="form-label">Database Name</label>
            <input class="form-control" id="uri" name="uri" type="text" placeholder="Database" df-database>
        </div>
    </div>
  </div>
</div>
`.trim().split('\n').join('').split('\t').join('');
editor.addNode('app', 0, 0, x, y, 'app', data, app);
}

function addExpress(x,y) {
    let data = { "route": "/", "method": "get" };
    let express = `
<div class="card m-0" style="width: 18rem;">
  <div class="card-header">
    @Express
  </div>
  <div class="card-body">
    <div class="row">
        <div class="col">
            <label for="Request" class="form-label">Request</label>
            <select class="form-select form-select-sm" aria-label="Request" df-method>
            <option selected value="get">GET</option>
            <option value="post">POST</option>
            <option value="put">PUT</option>
            <option value="delete">DELETE</option>
            </select>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <label for="route" class="form-label">Route</label>
            <input class="form-control" id="route" name="route" type="text" df-route>
        </div>
    </div>
  </div>
</div>
`.trim().split('\n').join('').split('\t').join('');
editor.addNode('express', 0, 1, x, y, 'express', data, express);
}

function addController(x,y){
    let data = { "ctrl": 'findAll' }
    let controller = `
    <div class="card m-0" style="width: 18rem;">
      <div class="card-header">
        @Controller
      </div>
      <div class="card-body">
        <div class="row">
            <div class="col">
                <label for="Controller" class="form-label">Action:</label>
                <select class="form-select form-select-sm" aria-label="Controller" df-ctrl>
                <option selected value="findAll">FindAll</option>
                <option value="findOne">FindOne</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="dropCollection">Delete Many</option>
                </select>
            </div>
        </div>
      </div>
    </div>
    `.trim().split('\n').join('').split('\t').join('');
    editor.addNode('controller', 1, 1, x, y, 'controller', data, controller);
}

function addScheme(x, y){
    let data = { "schema": "" }
    const schema = `
<div class="card m-0" style="width: 18rem;">
  <div class="card-header">
    @Schema
  </div>
  <div class="card-body">
    <div class="row">
        <div class="col">
            <label for="schema" class="form-label">Schema Name</label>
            <input class="form-control" id="schema" name="schema" placeholder="Schema Name" type="text" df-schema>
        </div>
    </div>
  </div>
</div>
`.trim().split('\n').join('').split('\t').join('');
editor.addNode('schema', 1, 1, x, y, 'schema', data, schema);
}

function addProp(x,y){
    let prop_data = {"type": "string", "name": ""};
    let prop = `
<div class="card m-0" style="width: 18rem;">
  <div class="card-header">
    @Prop
  </div>
  <div class="card-body">
    <div class="row">
    <div class="col">
        <label for="Prop name" class="form-label">Prop name:</label>
        <input type="text" class="form-control" placeholder="Prop name" aria-label="Prop name" df-name>
    </div>
    </div>
    <div class="row">
        <div class="col">
            <label for="Type" class="form-label">Prop type:</label>
            <select class="form-select form-select-sm" aria-label="Type" df-type>
                <option selected value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
                <option value="date">Date</option>
                <option value="encrypted">Date</option>
            </select>
        </div>
    </div>
  </div>
</div>
    `.trim().split('\n').join('').split('\t').join('');
    editor.addNode('prop', 1, 0, x, y, 'prop', prop_data, prop);
}

function addMiddleware(x,y){
    let data = { "code": "", "name": "" };
    data["code"] = vscode.value;

    let middleware = `
    <div class="card m-0" style="width: 18rem;">
      <div class="card-header">
        @Middleware
      </div>
      <div class="card-body">
        <div class="row">
            <div class="col">
            <label for="name" class="form-label">Middleware Name</label>
            <input class="form-control" id="name" name="name" placeholder="Middleware Name" type="text" df-name>
                <!--<button id="middleware" type="button" class="btn btn-outline-dark"
                data-bs-toggle="modal" data-bs-target="#codeModal">Edit Function</button>-->
            </div>
        </div>
      </div>
    </div>
    `.trim().split('\n').join('').split('\t').join('');
    editor.addNode('middleware', 1, 0, x, y, 'middleware', data, middleware);
}

//  MISC
function _clear(){
    const resp = confirm("Please Confirm!");
    if(!resp) return;
    editor.clearModuleSelected();
    _export();
}

//  IMPORT AND EXPORT
function _import(){
    const resp = confirm("Please Confirm!");
    if(!resp) return;
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    fetch('/model', {
        method: 'GET',
        headers: myHeaders,
    }).then(resp=> resp.json()).then(model=>{
        let _model = {
            drawflow: {
                Home: {
                    data:{}
                }
            }
        };
        _model['drawflow'] = model;
        editor.import(_model);
        confirm("Data Imported");
        presentModules();
    });
}

function _export(){
    const exportdata = editor.export();
    console.log(exportdata);
    const resp = confirm("Please Confirm!");
    if(!resp) return;
    const data = JSON.stringify(exportdata['drawflow']);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    fetch('/model', {
        method: 'POST',
        headers: myHeaders,
        body: data,
    }).then(resp=> resp.json())
    .then(result=> {
        confirm("Data Exported");
        console.log(result)
    });
}

//  MODULES
function addModule(_name){
    const el = document.getElementById('module-name');
    const name = el.value;
    editor.addModule(name);
    presentModules();
    el.value = "";
}

function remModule(){
    const resp = confirm("Please Confirm!");
    if(!resp) return;
    if(modules.length <= 1) return;
    const last = modules.reverse().shift();
    editor.removeModule(last);
    presentModules();
}

function changeModule(event) {
    let all = document.querySelectorAll(".menu ul li");
    for (let i = 0; i < all.length; i++) {
        all[i].classList.remove('selected');
    }
    event.target.classList.add('selected');
}

function presentModules(){
    const exportdata = editor.export();
    modules = Object.keys(exportdata['drawflow']);
    const ul = document.querySelector('#modules');
    ul.innerHTML = "";
    modules.forEach(el=>{
        const template = `<li class="text-dark" onclick="editor.changeModule('${el}'); changeModule(event);">${el}</li>`;
        ul.innerHTML += template;
    })
    ul.innerHTML += `<li class="text-dark"  data-bs-toggle="modal" data-bs-target="#ModuleModal">+</li>`
    ul.innerHTML += `<li class="text-dark" onclick="remModule()">-</li>`
}

