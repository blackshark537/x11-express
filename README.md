# X11-Express ( @Experimental )

![Demo](https://github.com/blackshark537/x11-express/raw/master/public/x11/imgs/demo.png)

Simple flow dynamic Expressjs framework.

X11-Express uses Drawflow.js to allow you create a backend application easy and fast. I think it's a great tool for educational purpose.

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

#### PM2
```javascript
[sudo] npm i pm2 -g
```
### Build
```javascript
npm run build
```

### Running
```javascript
pm2 start ./dist/main.js
```

### Develop
```javascript
npm start:dev
```

### Middleware
Middleware Function
```javascript
    "Example": (req: Request, res: Response, next: NextFunction)=>{
        console.log("Hello World! from middleware", req.query);
        next();
    },
```

middleware classes
Parameter | Type | Description
--- | --- | ---
`req` | Object | Express request
`res` | Object | Express response
`next` | Object | Express next

### MongoDB Data Model
Parameter | Type | Description
--- | --- | ---
`_id` | string | mongoose.types.objectid
`data` | Object | your data
`createdAt` | Date | created date 
`updatedAt` | Date | created date 

IE:
```javascript
    {
        "_id": "6284540185fc85b40e9e7798",
        "data": {
            "name": "One Plus 6T - 128GB - Mirror Black (Unlocked) (8GB RAM)",
            "price": 150.00,
            "category": "phones",
            "stock": 200,
        },
        "createdAt": "2022-05-18T02:03:45.468Z",
        "updatedAt": "2022-05-18T02:03:45.468Z",
    }
```
### Request query filters
```javascript
    //  FILTER QUERY
    //IE: Get some Object by String param value
    filters[data.param][$regex]=value
    filters[data.param][$eq]=value
    
    //  AND QUERY CHAIN
    //IE: Get some Object by conditional start - end String param value
    filters[$and][0][data.param1][$regex]=start&
    filters[$and][1][data.param2][$regex]=end

    //  OR QUERY CHAIN
    filters[$or][0][data.param1][$regex]=value&
    filters[$or][1][data.param2][$regex]=value

    //  CONDITIONAL
    //IE: Get some Object with conditional ($gt, $lt) Only Numbers param values.
   filters[data.param][$lt]=number
   filters[data.param][$gt]=number
   filters[data.param][$lte]=number
   filters[data.param][$gte]=number

    //IE: Get some Object with conditional ($eq) Boolean param values.
   filters[data.param][$eq]=true
   filters[data.param][$eq]=false
```

## License

Licensed under the [MIT](LICENSE) License.
