import 'dotenv/config';
import { connectDB } from './src/config/db.js';
import Admin from './src/models/Admin.js';

await connectDB();

const admin = await Admin.findOne();
if (admin) {
  console.log('Admin email:', admin.email);
  console.log('Admin name:', admin.name);
  console.log('Has passwordHash:', !!admin.passwordHash);
} else {
  console.log('No admin found');
}

process.exit(0);