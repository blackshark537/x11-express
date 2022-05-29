import { NextFunction, Request, Response } from "express";
import { Crypto } from '../services/ncrypt.service';
import { Jwt } from '../services/jwt.service';
import { fs } from '../services/file-system.service';
import { HttpCode } from '../interfaces/';

export const MiddlewareModule = { 
"Authorization":(req: Request, res: Response, next: NextFunction)=>{
    const btk = req.headers.authorization;
    const token = btk?.split(" ")[1] as string;
    const tk = Jwt.getInstance().decode(token);
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