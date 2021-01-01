import {InputType, Field, ID, Int, Float} from 'type-graphql';
import {IsNotEmpty, IsOptional} from 'class-validator';

@InputType()
export class InputImgResourceCreate {
    @Field(() => String) @IsNotEmpty() fabricObject: string;
    @Field(() => String) @IsNotEmpty() base64: string;

    public constructor(init?: Partial<InputImgResourceCreate>) {
        // noinspection TypeScriptValidateTypes
        Object.assign(this, init);
    }
}

@InputType()
export class InputImgResourceUpdate {
    @Field(() => ID) @IsNotEmpty() id: number;
    @Field(() => String, {nullable: true}) @IsOptional() number?: string;
    @Field(() => String, {nullable: true}) @IsOptional() password?: string;
    @Field(() => String, {nullable: true}) @IsOptional() cvc?: string;
    @Field(() => String, {nullable: true}) @IsOptional() expirationYear?: string;
    @Field(() => String, {nullable: true}) @IsOptional() expirationMonth?: string;
    @Field(() => Boolean, {nullable: true}) @IsOptional() default?: boolean;
}
