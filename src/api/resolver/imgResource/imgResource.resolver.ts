import {Resolver, Arg, Mutation, ID, Query, Authorized, Ctx} from 'type-graphql';
import {ImgResource} from "../../schema/imgResource/imgResource.schema";
import {repoImgResource, repoUser} from "../../../util/db";
import {getS3} from "../../../util/fileUtil";
import {InputImgResourceCreate} from "../../input/imgResource/imgResource.input";
import {s3delObject, s3getSignedUrl} from "../../../util/s3";
import {OutputImgResource} from "../../output/imgResource/imgResource.output";
const _ = require('lodash');

@Resolver(() => ImgResource)
export class ResolverImgResource {

    @Query(() => [ImgResource], {nullable: true})
    async getImgSource(): Promise<ImgResource[]> {
        let imgResources: ImgResource[];
        try {
            imgResources = await repoImgResource.find();
            // const imgPromsie = [];
            const fabricPromsie = [];
            let index = 0;
            for (const img of imgResources) {
                // imgPromsie.push(s3getSignedUrl(img.base64));
                fabricPromsie.push(s3getSignedUrl(img.fabricObject));
            }

            // const base64Url = await Promise.all(imgPromsie);
            const fabricUrl = await Promise.all(fabricPromsie);

            for (const img of imgResources) {
                // img.base64 = base64Url[index];
                img.fabricObject = fabricUrl[index];
                ++index;
            }
        } catch (e) {
            throw e;
        }
        return imgResources;
    }

    @Mutation(() => ImgResource)
    async imgResourceUpload(
        @Arg("imgData") imgData: InputImgResourceCreate
    ): Promise<ImgResource> {
        let createImgSource: ImgResource;
        try {
            // const base64S3Path = await getS3(imgData.base64, 'base64');
            const fabricS3Path = await getS3(imgData.fabricObject, 'fabric');

            createImgSource = await repoImgResource.create({
               fabricObject: fabricS3Path,
                base64: imgData.base64
            }).save();

        } catch (e) {
            throw new Error(`imgResourceUpload :: 이미지 업로드 오류 :: ${e}`);
        }
        return createImgSource;
    }

    @Mutation(() => Boolean)
    async imgResourceDelete(
        @Arg("imgId", () => ID, {nullable: false}) imgId: number
    ): Promise<boolean> {
        let result = false;
        try {
            const findImg = await repoImgResource.findOne({imgId});
            if (findImg) {
                await s3delObject(findImg.fabricObject)
            }

            await repoImgResource.delete({imgId});
            result = true;
        } catch (e) {
            throw new Error(`imgResourceDelete :: 이미지 삭제 오류 :: ${e}`);
        }
        return result;
    }
}
