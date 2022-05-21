import { NextFunction, Request, Response } from "express";
import { Cripto } from '../services/ncrypt.service';
import fs from 'fs';

export const middlewares = {
    "hello": (req: Request, res: Response, next: NextFunction)=>{
        console.log("hello");
        console.log("encripted", Cripto.encript("Hello"));
        res.send( Cripto.encript("Hello"));
    }
}