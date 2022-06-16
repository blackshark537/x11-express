import { NextFunction, Request, Response } from 'express';
import { KeyValue } from '../interfaces';
import { x11Controller } from './x11-controller.service';

export const ControllerModule: KeyValue = {
    "x11": (req: Request, res: Response, next: NextFunction) =>{
        const x11: KeyValue = x11Controller.getInstance();
        const { _function } = req.query;
        x11[`${_function}`](req, res, next);
    }
}