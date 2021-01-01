import {Field, ObjectType} from 'type-graphql';
import {IsNotEmpty} from 'class-validator';

@ObjectType()
export class OutputImgResource {
    @Field(() => String) @IsNotEmpty() base64: string;

    public constructor(init?: Partial<OutputImgResource>) {
        // noinspection TypeScriptValidateTypes
        Object.assign(this, init);
    }
}
