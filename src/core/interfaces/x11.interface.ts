
export interface x11Model{
    _collection: string;
    data: any;
    createdAt: Date;
    updatedAt: Date;
}

//  INTERFACES
export type KeyValue = { [name: string]: any }
export type KeyNode = { [name: string]: iNode };

export type KeyConnection = {
    [name: string]: Connection[]
}

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
    STRING='string',
    DATE="date",
    ENCRYPTED="encrypted",
}

export enum HttpCode{
    SUCCESS=200,
    BAD_REQUEST=400,
    UNAUTHORIZED=401,
    PAYMENT_REQUIRED=402,
    FORBIDDEN=403,
    NOT_FOUND=404,
    CONFLICT=409,
    SERVER_ERROR=500,
}