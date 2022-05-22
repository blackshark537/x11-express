import { readFileSync, writeFileSync, appendFileSync } from 'fs';

export class fs{

    read(path: string): string{
        return readFileSync(path, {encoding: 'utf-8'});
    }

    write(path: string, data: any){
        const _data = JSON.stringify(data);
        writeFileSync(path, _data, {encoding: 'utf-8'});
    }

    append(path: string, data: any){
        const _data = JSON.stringify(data);
        appendFileSync(path, _data, {encoding: 'utf-8'});
    }
}