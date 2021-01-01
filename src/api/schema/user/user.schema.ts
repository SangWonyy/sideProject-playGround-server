import {ObjectType, Field,ID} from 'type-graphql';
import {Entity, PrimaryGeneratedColumn, BaseEntity, Column, UpdateDateColumn, CreateDateColumn} from 'typeorm';

export enum UserRole {
    admin = 'admin',
    user = 'user',
    beta = 'beta'
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(type => ID, {nullable: false})
    @PrimaryGeneratedColumn()
    userId: number;

    @Field({defaultValue: 'user'})
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.user
    })
    role: string;

    @Field({nullable: true})
    @Column({type: 'varchar', default: null, length: 50, nullable: true})
    userPw: string;

    @Field({nullable: true})
    @Column({type: 'varchar', default: null, length: 50, nullable: true})
    userName: string;

    @Field()
    @CreateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)'})
    createdDate: Date;

    @Field()
    @UpdateDateColumn({type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP(6)', nullable: true})
    updatedDate: Date;

    public constructor(init?: Partial<User>) {
        super();
        // noinspection TypeScriptValidateTypes
        Object.assign(this, init);
    }
}
