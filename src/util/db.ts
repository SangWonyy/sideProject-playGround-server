import "reflect-metadata";
import {createConnection, getRepository, Connection, Repository} from "typeorm";
import {constDB} from "./constant";
import {User} from "../api/schema/user/user.schema";
import {ImgResource} from "../api/schema/imgResource/imgResource.schema";
let connection: Connection;
let repoUser: Repository<User>;
let repoImgResource: Repository<ImgResource>;
const dbInit = async (): Promise<boolean> => {
    let result = true;
    try {

        connection = await createConnection({
            type: "mariadb",
            host: constDB.HOST,
            port: 3306,
            username: constDB.USER,
            password: constDB.PW,
            database: constDB.DB,
            entities: [
                User,
                ImgResource
            ],
            synchronize: process.env.DB_SYNC === 'y',
            logging: process.env.DB_LOGGING === 'y',
        });

        repoUser = getRepository(User);
        repoImgResource = getRepository(ImgResource);

    } catch (err) {
        console.log(err);
        result = false;
    }
    return result;
};

const dbHealthCheck = async (): Promise<boolean> => {
    let result = true;
    try {
        await connection.query('SELECT 1;');
    } catch (err) {
        result = false;
    }
    return result;
};

export {
    dbInit,
    dbHealthCheck,
    repoUser,
    repoImgResource
};
