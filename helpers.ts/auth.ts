const bcrypt = require('bcrypt');


const hashPassword = async (password: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err: any, hash: any) => {
            if (err) reject(err);
            else resolve(hash);
        });
    });
};


const comparePassword = async (password: any, hashed: any) => {
     return bcrypt.compare(password, hashed)
}

export { hashPassword, comparePassword }
