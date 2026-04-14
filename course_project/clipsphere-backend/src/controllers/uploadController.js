const uploadService = require('../services/uploadService');
const Video = require('../models/Video');

exports.uploadVideo = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ status: 'error', message: 'No file uploaded' });

        let duration;
        try {
            const metadata = await uploadService.probeBuffer(req.file.buffer);
            duration = metadata.format.duration;
        } catch (probeErr) {
            return res.status(400).json({ status: 'error', message: 'Could not read video metadata' });
        }

        if (duration > 300) {
            return res.status(400).json({ status: 'error', message: 'Video exceeds 300 seconds (5 minutes) limit' });
        }

        const key = await uploadService.uploadToMinio(req.file.buffer, req.file.originalname);

        const video = await Video.create({
            title: req.body.title || req.file.originalname,
            description: req.body.description || '',
            owner: req.user.id,
            videoURL: key,
            duration: Math.floor(duration)
        });

        res.status(201).json({ status: 'success', data: { video } });
    } catch (err) {
        next(err);
    }
};

exports.getPresignedUrl = async (req, res, next) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ status: 'error', message: 'Video not found' });
        const url = await uploadService.getPresignedUrl(video.videoURL);
        res.status(200).json({ status: 'success', data: { url } });
    } catch (err) {
        next(err);
    }
};
