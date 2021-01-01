import S3 from 'aws-sdk/clients/s3';
import {logger} from './logger';
import {constAWS} from './constant';
import {Stream} from 'stream';

const s3 = new S3({apiVersion: '2006-03-01', region: constAWS.REGION});

console.log('s3 env = ', constAWS.S3.IMAGE);
console.log('process env = ', process.env.AWS_IMAGE);

const bucket = constAWS.S3.IMAGE;
const expireTime = 3600 * 6 * 4; // 1day

/** @description 이미지를 S3에 업로드
 * @param buffer
 * @param {string} ext 이미지 확장자
 * @return {string | null} 업로드된 S3 path. 오류시 null.
 */
const s3putObject = async function(buffer: any, type: string): Promise<string> {
    const path = `${new Date().getTime()}_${Math.random().toString(36).substr(2, 15)}.${type}`;
    const param: any = {
        Bucket: bucket,
        Key: path,
        Body: buffer,
    };

    try {
        const est = await s3.putObject(param).promise();
        console.log(est)
    } catch (err) {
        logger.error(err, {type: 's3_upload'});
    }
    return path;
};

const s3UpdateObject = async function(data: Stream, path: string, mimetype?: string, encoding?: string): Promise<string | null> {
    const buffer = await streamToBuffer(data);
    const param: any = {
        Bucket: bucket,
        Key: path,
        Body: buffer,
    };
    if (mimetype != null) {
        param.ContentType = mimetype;
    }
    if (encoding != null) {
        param.ContentEncoding = encoding;
    }
    try {
        await s3.putObject(param).promise();
    } catch (err) {
        logger.error(err, {type: 's3_upload'});
        return null;
    }
    return path;
};

/** @description 이미지의 signed url을 생성. 모든 이미지는 private 이므로, 클라이언트는 이 방법으로만 접근가능
 * @param {string} path 이미지의 S3 path
 * @return {String} 접근 가능한 signed url. 오류시 empty string.
 */
const s3getSignedUrl = async function(path: string): Promise<string> {
    try {

        path = path.replace(/^"|"$/g, '');
        return await s3.getSignedUrlPromise('getObject', {
            Bucket: bucket, Key: path, Expires: expireTime
        });
    } catch (err) {
        logger.error(err, {type: 's3_getSignedUrl'});
        return '';
    }
};

/** @description path의 s3오브젝트를 삭제
 * @param {string} path 이미지의 S3 path
 * @return {boolean} 성공여부 (API 성공여부와 직접 관련이 없으므로 실패하더라도 그냥 로직 진행하고 가비지 오브젝트 삭제 방안을 찾을것)
 */
const s3delObject = async function(path: string): Promise<boolean> {
    let isSucceed = true;
    try {
        await s3.deleteObject({
            Bucket: bucket + '', Key: path
        }).promise();
    } catch (err) {
        logger.error(err, {type: 's3_delObject'});
        isSucceed = false;
    }
    return isSucceed;
};

const s3Copy = function(key: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const extension = key.split('.').pop();
            const path = `${new Date().getTime()}_${Math.random().toString(36).substr(2, 15)}.${extension}`;
            const param: any = {
                Bucket: bucket,
                Key: path,
                CopySource: bucket + '/' + key,
                MetadataDirective: "COPY"
            };
            const copyResult = await s3.copyObject(param).promise();
            if (copyResult.$response.error === null) {
                resolve(path);
            } else {
                reject(copyResult.$response.error);
            }
        } catch (e) {
            reject(e);
        }
    });

};

function streamToBuffer(stream: Stream): Promise<Buffer> {
    const chunks: any[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

export {s3putObject, s3getSignedUrl, s3delObject, s3UpdateObject, s3Copy};
