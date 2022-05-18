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

//  TEXTAREA CODE
let _code = document.getElementById('code');
_code.value = `\tfunction middleware(req,res,next){\t\tnext();\n\t}\tmiddleware(req, res, next);`;

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

      switch (name) {
        case 'express':
            addExpress(pos_x,pos_y);
            break;
        case 'controller':
            addController(pos_x, pos_y);
        break;
        case 'middleware':
            addMiddleware(pos_x, pos_y);
        break;
        case 'schema':
            addScheme(pos_x, pos_y);
        break;
        case 'prop':
            addProp(pos_x, pos_y);
        break;
        case 'app':
            addApp(pos_x, pos_y);
        break;
        default:
            break;
      }
}


//  NODES TYPES DEFINITION
function addApp(x,y){
    const data = { "port": 3000, "mongoUri": "mongodb://localhost:27017/x11"};
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
            <input class="form-control" id="uri" name="uri" type="text" placeholder="Database" df-mongoUri>
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
                <option value="del">Delete</option>
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
            <option value="array">Array</option>
            <option value="date">Date</option>
            </select>
        </div>
    </div>
  </div>
</div>
    `.trim().split('\n').join('').split('\t').join('');
    let prop_data = {"type": "string", "name": ""};
    editor.addNode('prop', 1, 0, x, y, 'prop', prop_data, prop);
}

function addMiddleware(x,y){
    let data = { "code": "", "name": "" };
    const doc = cm.getDoc();
    const cd = doc["children"][0]['lines'].map(line=> line.text).join("");
    data["code"] = cd;

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
function edit(data){
    console.log(data);
}

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

