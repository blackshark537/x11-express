export interface x11Model{
    _collection: string;
    data: any;
    createdAt: Date;
    updatedAt: Date;
}

//  INTERFACES
export type KeyValue = { [name: string]: any }
export type KeyNode = { [name: string]: Node };

export interface Node{
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
    param?: {[name: string]: any};
    cond: string;
    numValue?: string;
    value?: string;
    filters?: any;
};

export enum PropTypes{
    DATE="date",
    ENCRYPTED="encrypted",
}