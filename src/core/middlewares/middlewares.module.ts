import { NextFunction, Request, Response } from "express";
import { fs } from '../services';
import { HttpCode, KeyValue } from '../interfaces';

export const x11MiddlewareModule: KeyValue = { 
    "sendFile": (req: Request, res: Response, next: NextFunction)=>{
        try {
            if(req.query?.path){
                const file = fs.read(`${req.query.path}`);
                res.status(HttpCode.SUCCESS);
                res.send(file);
                res.end();
             } 
        } catch (error: any) {
            res.status(HttpCode.SERVER_ERROR);
            res.json({
                msg: error['message'],
                code: HttpCode.SERVER_ERROR
            })
        }
    }
}