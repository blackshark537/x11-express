# X11-Express

![Demo](https://github.com/blackshark537/x11-express/raw/master/public/demo.png)

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

### Middleware
Middleware Definition
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

### Mongo Data Model
Parameter | Type | Description
--- | --- | ---
`_id` | string | mongoose.types.objectid
`table` | string | table name
`data` | Object | your data
`createdAt` | Date | created date 

IE.
```javascript
    {
        "_id": "6284540185fc85b40e9e7798",
        "table": "products",
        "data": {
            "name": "oneplus 6t 120GB 8GB Android",
            "price": 150,
            "category": "phones"
        },
        "createdAt": "2022-05-18T02:03:45.468Z",
    }
```
### Request Get filters
```javascript
   filters[data.param][$regex]=""
```

## License

[MIT](LICENSE)
