import { KeyValue } from "../core/interfaces";
import { NextFunction, Request, Response } from "express";

export const CustomMiddlewaresModule: KeyValue = { 
    "Example": (req: Request, res: Response, next: NextFunction)=>{
        console.log("Hello World! from middleware", req.query);
        next();
    },
}