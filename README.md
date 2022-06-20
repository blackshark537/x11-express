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
    (req: Request, res: Response, next: NextFunction) => {
        next();
    }
```

middleware classes
Parameter | Type | Description
--- | --- | ---
`req` | Object | Express request
`res` | Object | Express response
`next` | Object | Express next
`Crypto` | Class | To achive encryptions.
`Crypto.encrypt(data: any)` | Function | To encrypt data.
`Crypto.compare(data: any, hash: string)` | Function | returns a boolean.
`fs` | Class | To save read and append a file.
`fs.read(path: string)` | Function | To read a file.
`fs.write(path: string, data: any)` | Function | To write a file.
`fs.append(path: string, data: any)` | Function | Append to a file.

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
    //IE: Get some Object with conditional ($gt, $lt or $eq) Only Numbers and Boolean param values.
    filter=data.param&cond=$gt&value=value
    filter=data.param&cond=$lt&value=value
    filter=data.param&cond=$gte&value=value
    filter=data.param&cond=$lte&value=value
    filter=data.param&cond=$eq&value=value
```

## License

Licensed under the [MIT](LICENSE) License.
