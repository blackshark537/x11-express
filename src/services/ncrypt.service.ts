import * as bcrypt from "bcrypt";

export class Cripto{

    private static saltRounds = 10;

    private constructor(){}

    static encript(data: string): string{
        const salt = bcrypt.genSaltSync(this.saltRounds);
        return bcrypt.hashSync(data, salt);
    }

    static compare(hash: string, hashToCompareWith: string): boolean{
        return bcrypt.compareSync(hash, hashToCompareWith);
    }
}