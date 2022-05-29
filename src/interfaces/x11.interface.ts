export interface x11Model{
    _collection: string;
    data: any;
    createdAt: Date;
    updatedAt: Date;
}

//  INTERFACES
export type KeyValue = { [name: string]: any }
export type KeyNode = { [name: string]: iNode };

export interface iNode{
    id: number;
    name: string;
    class: string;
    html: string;
    data: KeyValue;
    outputs: {
        [name: string]: KeyConnection
    };
    inputs: {
        [name: string]: KeyConnection
    }
}

interface KeyConnection{
    [name: string]: Connection[]
}

interface Connection{
    node: string
}

export interface iQuery{
    module: string;
    schema: string;
    collection: string;
    filter?: {[name: string]: any};
    cond: string;
    value?: string;
    filters?: any;
};

export enum PropTypes{
    DATE="date",
    ENCRYPTED="encrypted",
}

export enum HttpCode{
    SUCCESS=200,
    CONFLICT=409,
    FORBIDDEN=403,
    NOTFOUND=404,
    SERVER_ERROR=500,
}