import {Resolver, Arg, Mutation, ID, Query, Authorized, Ctx} from 'type-graphql';
import {User} from '../../schema/user/user.schema';


import {repoUser} from '../../../util/db';
import {Context} from 'vm';

@Resolver(() => User)
export class ResolverUser {

    @Query(() => [User], {nullable: true})
    async getAllUser(): Promise<User[]> {
        let users: User[];
        try {
            users = await repoUser.find();
        } catch (e) {
            throw e;
        }
        return users;
    }

    @Mutation(() => Boolean, {nullable: true})
    async createUser(): Promise<boolean> {
        let result = false;
        try {
            const createUser = await repoUser.create().save();
            result = true;
        } catch (e) {
            throw e;
        }
        return result;
    }
}
