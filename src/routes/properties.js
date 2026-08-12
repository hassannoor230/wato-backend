import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Property from '../models/Property.js';
import { protect } from '../middleware/auth.js';
import { slugify } from '../utils/slug.js';

const router = express.Router();
const uploadDir = path.resolve('uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-')}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

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
    const q = { slug };
    if (slug.length === 24 && /^[0-9a-fA-F]{24}$/.test(slug)) q._id = slug;
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
    const data = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ message: 'Property not found' });
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    next(e);
  }
});

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
  res.json({
    data: {
      url: `${process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`}/uploads/${req.file.filename}`,
      publicId: req.file.filename,
    },
  });
});

export default router;
