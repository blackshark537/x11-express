# X11-Express

![Demo](https://github.com/blackshark537/x11-express/raw/master/public/demo.png)

Simple flow dynamic backend framework.

X11-Express uses Drawflow.js to allow you create a backend application easily and quickly.

## Features
- Drag Nodes
- Config your Server Port
- Create Modules
- Set Routes
- Set Methods
- Set Controllers
- Middleware Editor
- Set Schema
- Set Schema Props
- Load Backend
- Save your Backend

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
`_collection` | string | collection name
`data` | Object | your data
`createdAt` | Date | created date 
`updatedAt` | Date | created date 

IE:
```javascript
    {
        "_id": "6284540185fc85b40e9e7798",
        "_collection": "products",
        "data": {
            "name": "One Plus 6T - 128GB - Mirror Black (Unlocked) (8GB RAM)",
            "price": 150.00,
            "category": "phones"
        },
        "createdAt": "2022-05-18T02:03:45.468Z",
        "updatedAt": "2022-05-18T02:03:45.468Z",
    }
```
### Request query filters
```javascript
    //  STRING QUERY
    //IE: Get some String value
    filters[data.param][$regex]=value
    filters[data.param][$eq]=value
    
    //  AND CHAIN QUERY
    //IE: Get some String value by start and end
    filters[$and][0][data.param][$regex]=start&
    filters[$and][1][data.param][$regex]=end

    //  OR CHAIN QUERY
    filters[$or][0][data.param1][$regex]=value&
    filters[$or][1][data.param2][$regex]=value

    //  CONDITIONAL
    //IE: Get some Number value with conditional $gt $lt or $eq
    filter=data.param&cond=$gt&numValue=value
    filter=data.param&cond=$lt&numValue=value
    filter=data.param&cond=$gte&numValue=value
    filter=data.param&cond=$lte&numValue=value
    filter=data.param&cond=$eq&numValue=value
```

## License

[MIT](LICENSE)
