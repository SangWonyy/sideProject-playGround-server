import {ObjectType, Field,ID} from 'type-graphql';
import {Entity, PrimaryGeneratedColumn, BaseEntity, Column, UpdateDateColumn, CreateDateColumn} from 'typeorm';

@ObjectType()
@Entity()
export class ImgResource extends BaseEntity {
    @Field(type => ID, {nullable: false})
    @PrimaryGeneratedColumn()
    imgId: number;

    @Field(() => String, {nullable: false})
    @Column({type: 'longtext', nullable: false})
    fabricObject: string;

    @Field(() => String, {nullable: false})
    @Column({type: 'longtext', nullable: false})
    base64: string;

    @Field()
    @CreateDateColumn({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)'})
    createdDate: Date;

    @Field()
    @UpdateDateColumn({type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP(6)', nullable: true})
    updatedDate: Date;

    public constructor(init?: Partial<ImgResource>) {
        super();
        // noinspection TypeScriptValidateTypes
        Object.assign(this, init);
    }
}
