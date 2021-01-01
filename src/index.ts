import "reflect-metadata";
import {buildTypeDefsAndResolvers} from "type-graphql";
import {ResolverUser} from "./api/resolver/user/user.resolver";
import {ApolloServer} from "apollo-server-fastify";
import fastify from 'fastify';
import {dbInit, dbHealthCheck} from "./util/db";
import {constPort} from "./util/constant";
import {logger} from './util/logger';
import {ResolverImgResource} from "./api/resolver/imgResource/imgResource.resolver";

const package_data = require('../package.json');
const start = async () => {
    // DB 초기화 및 스키마 싱크
    if (!(await dbInit())) {
        logger.error('db init failed');
        process.exit(1);
    }
    //aollo graphQL 초기화
    const {typeDefs, resolvers} = await buildTypeDefsAndResolvers({
        resolvers: [
            ResolverUser,
            ResolverImgResource
        ]
    })
    const apollo = new ApolloServer({
        typeDefs,
        resolvers,
        "uploads": false, // ! apollo 기본 uploader는 type-graphql과 충돌이 있어 비활성화
        "playground": true,
        "tracing": true, // apollo playground에서 tracing(속도) 킨다
    });

    // fastify bodyLimit 컨트롤
    const server: fastify.FastifyInstance = fastify({
        bodyLimit: 1024 * 1024
    });

    // 헬스 체크
    server.get('/health', async () => {
        const check = await dbHealthCheck();
        if (check === true) {
            return 'ok db is ok' + ', version :' + package_data.version;
        } else {
            throw new Error('fail');
        }
    });

    // fastify에 apollo 적용 및 기동
    try {
        server.register(require('fastify-gql-upload'), {
            maxFieldSize: 1024 * 1024
        });
        server.register(apollo.createHandler());
        await server.listen(constPort, '0.0.0.0', (err, address) => {
            console.log(process.version);
            console.log(`error : ${err}`);
            console.log(`address : ${address}`);
        });
        logger.info(`server started with ${constPort} port`);
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
};

start()

