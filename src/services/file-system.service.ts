import { readFileSync, writeFileSync, appendFileSync } from 'fs';

export class fs{

    private constructor(){}
    
    static read(path: string): string{
        return readFileSync(path, {encoding: 'utf-8'});
    }

    static write(path: string, data: any){
        const _data = JSON.stringify(data);
        writeFileSync(path, _data, {encoding: 'utf-8'});
    }

    static append(path: string, data: any){
        const _data = JSON.stringify(data);
        appendFileSync(path, _data, {encoding: 'utf-8'});
    }
}