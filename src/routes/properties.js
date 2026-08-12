import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import Property from '../models/Property.js';
import { protect } from '../middleware/auth.js';
import { slugify } from '../utils/slug.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

async function cleanupImages(images) {
  if (!Array.isArray(images)) return;
  await Promise.allSettled(
    images.map((img) => img?.publicId ? deleteFromCloudinary(img.publicId).catch(() => {}) : Promise.resolve())
  );
}

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, propertyType, listingType, status, featured } = req.query;
    const q = {};
    if (status) q.status = status;
    else q.status = 'published';
    if (propertyType) q.propertyType = propertyType;
    if (listingType) q.listingType = listingType;
    if (featured !== undefined) q.featured = featured === 'true';
    if (search) q.$or = [{ title: new RegExp(search, 'i') }, { location: new RegExp(search, 'i') }, { city: new RegExp(search, 'i') }];

    const p = Math.max(1, Number(page));
    const l = Math.min(100, Number(limit));
    const [data, total] = await Promise.all([
      Property.find(q).sort({ featured: -1, createdAt: -1 }).skip((p - 1) * l).limit(l),
      Property.countDocuments(q),
    ]);
    res.json({ data, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } });
  } catch (e) {
    next(e);
  }
});

router.get('/admin/list', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search } = req.query;
    const q = {};
    if (search) q.$or = [{ title: new RegExp(search, 'i') }, { location: new RegExp(search, 'i') }, { city: new RegExp(search, 'i') }];
    const p = Math.max(1, Number(page));
    const l = Math.min(100, Number(limit));
    const [data, total] = await Promise.all([
      Property.find(q).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      Property.countDocuments(q),
    ]);
    res.json({ data, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } });
  } catch (e) {
    next(e);
  }
});

router.get('/admin/all', protect, async (req, res, next) => {
  try {
    const data = await Property.find().sort({ createdAt: -1 });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const q = slug.length === 24 && /^[0-9a-fA-F]{24}$/.test(slug)
      ? { $or: [{ slug }, { _id: new mongoose.Types.ObjectId(slug) }] }
      : { slug };
    const data = await Property.findOne(q);
    if (!data) return res.status(404).json({ message: 'Property not found' });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.use(protect);

router.post('/', async (req, res, next) => {
  try {
    const body = { ...req.body };
    body.slug = body.slug || slugify(body.title) + '-' + Date.now().toString().slice(-6);
    const data = await Property.create(body);
    res.status(201).json({ data });
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const existing = await Property.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Property not found' });

    const removedImages = (existing.images || []).filter(
      (oldImg) => !(req.body.images || []).some((newImg) => newImg?.publicId === oldImg.publicId)
    );

    const data = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (removedImages.length > 0) {
      cleanupImages(removedImages).catch(() => {});
    }
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await Property.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Property not found' });

    await cleanupImages(existing.images || []);
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ message: 'Cloudinary is not configured on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.' });
    }
    const result = await uploadToCloudinary(req.file.buffer, 'properties');
    res.json({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

export default router;