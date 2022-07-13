import { NextFunction, Request, Response } from "express";
import { File, Crypto, Jwt } from '../services';
import { HttpCode, KeyValue } from '../interfaces';

export const x11MiddlewareModule: KeyValue = { 
    "sendFile": (req: Request, res: Response, next: NextFunction)=>{
        try {
            if(req.query?.path){
                const file = File.read(`${req.query.path}`);
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
    },
    "compare (ncrypt)": (req: Request, res: Response, next: NextFunction)=>{
        const field = req.query.field;
        const model = req.query.model;
        console.log({
            field,
            model,
        });
        next();
    },
    'createToken': (req: Request, res: Response, next: NextFunction)=>{
        const token = Jwt.getInstance().encode({
            createdAt: new Date().getTime(),
            expiredAt: new Date().getTime() + 15 * 24 * 60*60*1000,
            user: req.body.email
        });
        res.status(200);
        res.json({
            token,
            user: req.body.email
        });
    }
}