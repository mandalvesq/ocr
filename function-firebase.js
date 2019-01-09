const functions = require('firebase-functions');
const admin = require('firebase-admin');
import os from 'os';
import fs from 'fs-extra';
import { spawn } from 'child-process-promise';
import gs from 'gs';

const {firebase: {projectId, storageBucket}} = functions.config();
const BUCKET_NAME = storageBucket;

const gcs = require(@google-cloud/storage)({
    projectId,
    keyFilename: 'serviceAccount.json',

})
const bucket = gcs.bucket(BUCKET_NAME);

export const processPDFDocUpload = async ({data, params: {requestId}}) => {
    const downloadPath = path.join(os.tmpdir(), `path/to/file/download`);
    const downloadedPDF = `${downloadPath}/<filename>`;
    const imagesPath = `${filePath}/images`;
    const imgDir = path.join(os.tmpdir(), imagesPath);

    await Promise.all([
        fs.ensureDir(downloadPath),
        fs.ensureDir(imgDir),
    ]);
}

await bucket.file('path/to/file/name.pdf')
.download({ destination: downloadedPDF });

await new Promise((resolve, reject) => {
gs()
    .batch()
    .nopause()
    .q()
    .device('jpeg')
    .executablePath('functions/lambda-ghostscript/bin/./gs')
    .option('--dTextAlphaBits=4')
    .res(300)
    .output(`${imgDir}/page-$03d.jpg`)
    .input(downloadedPDF)
    .exec((err) => {
        if (err) {
            console.log('Error running Ghostscript', err);
            reject(err);
        } else {
            console.log('GhostScript process completed successfully');
            resolve();
        }
    });

})

const mogrifySettings = [
    '--format', 'jpg',
    '--resize', '1275x1650',
    '--limit', 'area', '256MB',
    '--limit', 'memory', '256MB',
    '--limit', 'map', '512MB',
    '*.jpg',
]

const spawnEnvSettings = {
    capture: ['stdout', 'stderr'],
    cwd: imgDir,
};

const mogrifyProcess = await spawn('mogrify', mogrifySettings, spawnEnvSettings);
mogrifyProcess.childProcess.kill();

const imageFileNames = await fs.readdir(imgDir);

await Promise.all(map(imageFileNames, imageFileName => 
    bucket.upload(
        `${imgDir}/${imageFileName}`,
        { destination: `${imagesPath}/${imageFileName}`}
    )
    ));

await Promise.all([
    fs.remove(downloadPath),
    fs.remove(imgDir),
]);

    return null;