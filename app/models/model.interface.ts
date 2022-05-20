export interface x11Model{
    _collection: string;
    data: any;
    createdAt: Date;
    updatedAt: Date;
}

//  INTERFACES
export interface KeyValue{ [name: string]: any }

export interface Node{
    id: number;
    name: string;
    class: string;
    html: string;
    data: KeyValue;
    outputs: {
        [name: string]: {
            connections: {
                node: string
            }[]
        }
    };
    inputs: {
        [name: string]: {
            connections: {
                node: string
            }[]
        }
    }
}