const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const { Readable } = require('stream');
const { randomUUID } = require('crypto');
const s3 = require('../config/minio');

ffmpeg.setFfprobePath(ffprobeStatic.path);

exports.probeBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = Readable.from(buffer);
        ffmpeg.ffprobe(stream, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata);
        });
    });
};

exports.uploadToMinio = async (buffer, originalname) => {
    const key = `${randomUUID()}-${Date.now()}.mp4`;
    await s3.send(new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'video/mp4'
    }));
    return key;
};

exports.getPresignedUrl = async (key) => {
    const cmd = new GetObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: key
    });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
    const internalBase = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    const publicBase = process.env.MINIO_PUBLIC_BASE || 'http://localhost:9000';
    return url.replace(internalBase, publicBase);
};

exports.getPublicUrl = (key) => {
    const publicBase = process.env.MINIO_PUBLIC_BASE || 'http://localhost:9000';
    const encodedKey = encodeURIComponent(key).replace(/%2F/g, '/');
    return `${publicBase}/${process.env.MINIO_BUCKET}/${encodedKey}`;
};

exports.deleteFromMinio = async (key) => {
    try {
        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.MINIO_BUCKET,
            Key: key
        }));
    } catch (err) {
        console.error('MinIO delete error:', err.message);
    }
};
