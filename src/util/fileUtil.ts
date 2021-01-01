import {FileUpload} from "graphql-upload";
import {logger} from "./logger";
import {debug} from "winston";
import {s3putObject, s3UpdateObject} from "./s3";

const getS3 = async (str: string, type: string): Promise<string> => {
    let buffer;
    let s3Path;
    try {
        buffer = stringtoBuffer(str);
        s3Path = await s3putObject(buffer, type)
    } catch (e) {
        throw new Error(`getS3 Err :: ${e}`);
    }
    return s3Path;
};

const getUpdateS3 = async (paths: any[], files: Promise<FileUpload>[]): Promise<Array<Promise<any>>> => {
    let promisesForS3: Array<Promise<any>>;
    let fileDatas: any[] = [];
    let fileUploads: FileUpload[];

    try {

        fileUploads = await Promise.all(files.map(file => file));

        fileDatas = fileUploads.map((file: FileUpload) => {
            const {filename, mimetype, encoding, createReadStream} = file;
            const extension = filename.split('.').pop();
            if (extension == null) {
                const err = `filename error : ${filename}`;
                debug(`extension is empty : ${filename}`);
                logger.error(err, {
                    from: 'mutation - userResourceResolver',
                    cause: 'extension is empty',
                });
                throw err;
            }
            return {
                encoding,
                mimetype,
                stream: createReadStream(),
                extension,
                imgName: filename
            };
        });

    } catch (e) {
        debug("%O", e);
        console.error(e.message);
    }


    promisesForS3 = fileDatas.map((data, index) => {
        let s3Key = paths.find( (path) => (path.indexOf(data.extension) > -1));
        if (!s3Key) {
            if (data.extension === 'svg' || data.extension === 'png') {
                s3Key = paths.find( (path) => path.indexOf('Base64') > -1);
                if (!s3Key) {
                    s3Key = paths[0];
                }
            }
        }
        return s3UpdateObject(data.stream, s3Key, data.mimetype, data.encoding);
    });

    return promisesForS3;
};

const stringtoBuffer = (str: string) => {
    const buffer = Buffer.from(str);
    return buffer;
}

// const blobToFile = (theBlob: object, fileName: string): File => {
//     const b: any = theBlob;
//     const fabricFile = new File([b], fileName);
//     return fabricFile
// }
// const b64toFile = (dataURI: string, baseName: string): File => {
//     try {
//         const ab = base64ToArrayBuffer(dataURI);
//         const blob = new Blob([ab], { type: 'text/plain' });
//         const baseFile = new File([blob], baseName, { type: 'text/plain', lastModified: new Date().getTime() });
//         return baseFile;
//     } catch (e) {
//         return e;
//     }
// }
//
// const base64ToArrayBuffer = (base64Data: string) => {
//     const byteString = atob(base64Data.split(',')[1]);
//     const ab = new ArrayBuffer(byteString.length);
//     // ia 지우면 안된다 arraybuffer 의 view로 사용
//     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
//     const ia = new Uint8Array(ab);
//
//     for (let i = 0; i < byteString.length; i++) {
//         ia[i] = byteString.charCodeAt(i);
//     }
//     return ab;
// }
export {getS3, getUpdateS3};
