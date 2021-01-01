const constPort = 8080;
const constDB = {
    TYPE: process.env.MYSQL_TYPE,
    DB: process.env.MYSQL_DB,
    HOST: process.env.MYSQL_ADDRESS,
    USER: process.env.MYSQL_USER,
    PW: process.env.MYSQL_PW,
};

const constAWS = {
    REGION: 'ap-northeast-2',
    S3: {
        IMAGE: process.env.AWS_IMAGE
    }
};

export {
    constPort,
    constDB,
    constAWS
};
