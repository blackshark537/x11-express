
import { JwtPayload, Secret, sign, verify } from 'jsonwebtoken';

export class Jwt {

    private static Instance: Jwt;

    private secret: Secret = {
        key: process.env.SECRETKEY || 'my secret token key',
        passphrase: process.env.SECRET || 'MySecret'
    };

    private constructor(){}

    public static getInstance(): Jwt{
        if(!this.Instance) this.Instance = new Jwt();
        return this.Instance;
    }

    encode(payload: JwtPayload): string{
        try{
            return sign(payload, this.secret, {algorithm: 'HS256', expiresIn: '15d' });
        } catch(error){
            throw new Error(`Jwt Signing Error: ${error}`);
        }
    }

    decode(token: string): string | JwtPayload{
        try{
            return verify(token, this.secret);
        } catch(error){
            throw new Error(`Jwt Signing Error: ${error}`);
        }
    }

    set secretKey(secret: Secret){
        this.secret = secret;
    }

}