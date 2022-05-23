import { NextFunction, Request, Response } from 'express';
import { KeyValue } from '../interfaces/';
import { x11Controller } from './x11-controller.service';

export const ControllerModule = {
    "x11": (req: Request, res: Response, next: NextFunction) =>{
        const x11: KeyValue = x11Controller.getInstance();
        const { func } = req.query;
        x11[`${func}`](req, res, next);
    }
}