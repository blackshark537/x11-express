import * as bcrypt from "bcrypt";

export class Crypto{

    private static saltRounds = 10;

    private constructor(){}

    static encrypt(data: any): string{
        const strData = JSON.stringify({data});
        const salt = bcrypt.genSaltSync(this.saltRounds);
        return bcrypt.hashSync(strData, salt);
    }

    static compare(data: any, hashToCompareWith: string): boolean{
        const strData = JSON.stringify({data});
        return bcrypt.compareSync(strData, hashToCompareWith);
    }
}