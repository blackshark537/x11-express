# X11-Express

Simple flow framework.

X11-Express uses Drawflow to allows you to create a backend application easily and quickly.

## Features
- Drag Nodes
- Config your Server Port
- Create Modules
- Create Rotes
- Set Methods
- Custom Controllers
- Middleware Editor
- Create Schema
- Set Schema Props
- Save your Backend Schema

## Installation
Download or clone repository.

#### Clone
`git clone https://github.com/blackshark537/x11-express.git`

#### NPM
```javascript
npm i --save
```

### Running
```javascript
npm start
```

### Define Middleware
Start drawflow.
```javascript
    function middleware(req,res,next){
        next();
    }
    middleware(req, res, next);
```

Middleware context parameters.

Parameter | Type | Description
--- | --- | ---
`req` | Object | Express request
`res` | Object | Express response
`next` | Object | Express next
`logs` | Array | To console.log
`file` | Object | To save file
`file.name` | string | Name of the file
`file.data` | Array | Data to save in file

## License

[MIT](LICENSE)
