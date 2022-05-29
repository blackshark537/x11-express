import { NextFunction, Request, Response } from "express";
import { Crypto } from '../services/ncrypt.service';
import { fs } from '../services/file-system.service';
import { HttpCode } from '../interfaces/';

export const MiddlewareModule = { 
"Authorization":(req: Request, res: Response, next: NextFunction)=>{
    const btk = req.headers.authorization;
    const tk = btk?.split(" ")[1];
    if(tk){ 
        //decode token
        next();
    } else {
        res.json({
            status: HttpCode.FORBIDDEN,
            msg: "Access Forbidden"
        });
    }
 },
"SendView":(req: Request, res: Response, next: NextFunction)=>{
    const file = fs.read(`views/${req.query.page}`);
    res.send(file);
    res.end();
}

}