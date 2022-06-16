'use strict';
//  DRAW FLOW
const id = document.getElementById("drawflow");
const editor = new Drawflow(id);
editor.reroute = true;
editor.zoom_min = 0.4;
editor.start();

// INIT
listCollections();
listCollections("custom");
listMiddlewares();
_import();

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
const vscode = document.getElementById("vscode");

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

//  HTTP

async function getMiddlewares(){
    let resp = await fetch("/middlewares",{
        method: "GET"
    }).catch(error=> console.error(error));
    resp = resp.json();
    return resp;
}

async function createMiddleware(middlewareName){
    const _data = {
        name: middlewareName,
        code: vscode.value
    }
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let resp = await fetch('/middlewares/new', {
        body: JSON.stringify({..._data}),
        headers: myHeaders,
        method: "POST",
    });
    
    return resp.json();
}

async function editMiddleware(id){
    console.log(id);
    const middlewareName = document.getElementById('middleware-name');
    middlewareName.value = id;
    vscode.src = `/middleware/code/${id}`;
    const myModal = new bootstrap.Modal(document.getElementById('codeModal'), {
        keyboard: false
    });
    myModal.show();
}

async function listMiddlewares(){
    const middlewareList = await getMiddlewares();
    
    const list = document.getElementById('middlewareList');
    list.innerHTML="";

    middlewareList.middlewares.forEach(_middleware=>{
        const middleware = document.getElementById("middleware-name");
        middleware.value = _middleware;
        list.innerHTML += `<li class="list-group-item" ><div draggable="true" ondragstart="drag(event)" data-node="${_middleware}-custom-middleware">
        <i class="fa-solid fa-filter mr-1"></i> <span>${_middleware.toLowerCase()}</span>
    </div></li>`;
    })
}

async function getCollections(type="x11"){
    let resp = await fetch(`/collections?type=${type}`,{
        method: "GET"
    }).catch(error=> console.error(error));
    resp = resp.json();
    return resp;
}

async function createCollection(collection){
    const _data = {
        collection: collection,
    }
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let resp = await fetch('/collections/new', {
        body: JSON.stringify({..._data}),
        headers: myHeaders,
        method: "POST",
    });
    
    return resp.json();
}

async function listCollections(type="x11"){
    const collectionList = await getCollections(type);
    const list = type==='x11'? document.getElementById('collectionList') : document.getElementById('customCollectionList');
    
    collectionList.collections.forEach(_collection=>{
        const collection = document.getElementById("collection-name");
        collection.value = _collection;
        list.innerHTML += `<li class="list-group-item" ><div class="" draggable="true" ondragstart="drag(event)" data-node="${_collection}-${type}-schema">
        <i class="fa-solid fa-database mr-1"></i> <span>${_collection}</span>
    </div></li>`;
    })
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

    const nodeTypes = {
        "app": (x,y)=> addApp(x,y),
        "express": (x,y)=> addExpress(x,y),
        "controller":(x,y)=> addController(x,y),
        "middleware": (x,y)=> addMiddleware(x,y),
        "collection": (x,y)=> addScheme(x,y),
        "prop": (x,y)=> addProp(x,y),
        "sendFile": (x,y)=> sendFile(x,y)
    }
    
    if(!Object.keys(nodeTypes).includes(name)) {
        if(name.includes("custom-schema")) addCustomScheme(pos_x, pos_y, name.split("-")[0]);
        if(name.includes("x11-schema")) addScheme(pos_x, pos_y, name.split("-")[0]);
        if(name.includes("custom-middleware")) addMiddleware(pos_x, pos_y, name.split("-")[0]);
        return;
    }
    nodeTypes[name](pos_x, pos_y);
}

//  NODES TYPES DEFINITION
function addApp(x,y){
    const data = { "port": 3000, "database": "x11", "usecors": ""};
    const app = `<div class="card m-0" style="width: 18rem;">
  <div class="card-header">
    @App Configuration
  </div>
  <div class="card-body">
    <div class="row">
        <div class="col">
            <label for="port" class="form-label">App Port:</label>
            <input class="form-control" id="port" name="port" placeholder="App Port ie: 3000 " type="number" df-port>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <label for="uri" class="form-label">Database Name:</label>
            <input class="form-control" id="uri" name="uri" type="text" placeholder="Database" df-database>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <label for="cors" class="form-label">Use Cors:</label>
            <select class="form-select form-select-sm" aria-label="cors" df-useCors>
            <option selected value="no">No</option>
            <option value="yes">Yes</option>
        </div>
    </div>
  </div>
</div>
`.trim().split('\n').join('').split('\t').join('');
editor.addNode('app', 0, 0, x, y, 'app', data, app);
}

function addExpress(x,y) {
    let data = { "route": "/", "method": "get", "access": "public" };
    let express = `
<div class="card m-0" style="width: 18rem;">
  <div class="card-header">
    @Express
  </div>
  <div class="card-body">
    <div class="row">
        <div class="col">
            <label for="route" class="form-label">Route:</label>
            <input class="form-control" id="route" name="route" type="text" df-route>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <label for="Request" class="form-label">Request:</label>
            <select class="form-select form-select-sm" aria-label="Request" df-method>
            <option selected value="get">GET</option>
            <option value="post">POST</option>
            <option value="put">PUT</option>
            <option value="patch">PATCH</option>
            <option value="delete">DELETE</option>
            </select>
        </div>
    </div>
  </div>
</div>
`.trim().split('\n').join('').split('\t').join('');
editor.addNode('express', 0, 1, x, y, 'express', data, express);
}

function sendFile(x,y) {
    let data = { "path": "", "type": "x11", "name": "sendFile" };
    let express = `
<div class="card m-0" style="width: 18rem;">
  <div class="card-header">
    @Send File
  </div>
  <div class="card-body">
    <div class="row">
        <div class="col">
            <label for="filename" class="form-control-label">Path</label>
            <input class="form-control" id="filename" name="filename" type="text" df-path>
        </div>
    </div>
  </div>
</div>
`.trim().split('\n').join('').split('\t').join('');
editor.addNode('x11-Mid', 1, 0, x, y, 'x11-Mid', data, express);
}

function addController(x,y, name="x11"){
    let data = { "func": 'findAll', "name": name };

    let controller = `
    <div class="card m-0" style="width: 18rem;">
      <div class="card-header">
        @${name}-Controller
      </div>
      <div class="card-body">
        <div class="row">
            <div class="col">
                <label for="Controller" class="form-label">Action:</label>
                <select class="form-select form-select-sm" aria-label="Controller" df-func>
                <option selected value="findAll">FindAll</option>
                <option value="findOne">FindOne</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                </select>
            </div>
        </div>
      </div>
    </div>
    `.trim().split('\n').join('').split('\t').join('');

    editor.addNode('controller', 1, 1, x, y, 'controller', data, controller);
}

async function addMiddleware(x,y, name){
    const middlewareName = name? name : document.getElementById("middleware-name").value;
    await createMiddleware(middlewareName);

    let data = { "name": "", "type": "custom" };
    data["code"] = vscode.value;
    data["name"] = middlewareName;

    let middleware = `
    <div class="card m-0" style="width: 18rem;">
      <div class="card-header">
        @Custom Middleware
        <button class="btn btn-dark" onclick="editMiddleware('${middlewareName}')">
        <i class="fa-solid fa-eye"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="row">
            <div class="col">
            <label for="name" class="form-label">Middleware Name</label>
            <h5>${middlewareName}</h5>
            </div>
        </div>
      </div>
    </div>
    `.trim().split('\n').join('').split('\t').join('');
    editor.addNode('middleware', 1, 1, x, y, 'middleware', data, middleware);
}

async function addCustomScheme(x, y, name){
    const collection = name? name : document.getElementById("collection-name").value;

    let data = { "schema": `${collection}`, "type": "custom" }
    const schema = `
<div class="card m-0" style="width: 18rem;">
  <div class="card-header">
    @x11-Collection
  </div>
  <div class="card-body">
    <div class="row">
        <div class="col">
            <label for="schema" class="form-label">Collection Name</label>
            <h5>${collection} </h5>
        </div>
    </div>
  </div>
</div>
`.trim().split('\n').join('').split('\t').join('');
editor.addNode('schema', 1, 0, x, y, 'schema', data, schema);
}

async function addScheme(x, y, name){
    const collection = name? name : document.getElementById("collection-name").value;
    await createCollection(collection);

    let data = { "schema": `${collection}`, "type": "x11" }
    const schema = `
<div class="card m-0" style="width: 18rem;">
  <div class="card-header">
    @x11-Collection
  </div>
  <div class="card-body">
    <div class="row">
        <div class="col">
            <label for="schema" class="form-label">Collection Name</label>
            <h5>${collection} </h5>
            <p class="schema-data">Props</p>
        </div>
    </div>
  </div>
</div>
`.trim().split('\n').join('').split('\t').join('');
editor.addNode('x11-schema', 1, 1, x, y, 'x11-schema', data, schema);
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
                <option value="date">Date</option>
                <option value="encrypted">Encrypted</option>
            </select>
        </div>
    </div>
  </div>
</div>
    `.trim().split('\n').join('').split('\t').join('');
    editor.addNode('prop', 1, 0, x, y, 'prop', prop_data, prop);
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

