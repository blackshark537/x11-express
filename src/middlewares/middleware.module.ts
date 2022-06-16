import { NextFunction, Request, Response } from "express";
import { KeyValue } from "../core/interfaces";

export const CustomMiddlewaresModule: KeyValue = { 
    "helloworld": (req: Request, res: Response, next: NextFunction)=>{
        console.log("Hello World!", req.query);
        next();
    },
}