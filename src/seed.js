import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import Admin from './models/Admin.js';
import Property from './models/Property.js';
import Service from './models/Service.js';
import Review from './models/Review.js';
import FAQ from './models/FAQ.js';
import Gallery from './models/Gallery.js';
import Setting from './models/Setting.js';

const services=[
  ['Property Buying','Find verified residential and commercial properties with local expertise.','home'],
  ['Property Selling','Position your property for maximum qualified-buyer exposure.','trending-up'],
  ['Investment Advisory','Identify high-potential opportunities with practical ROI guidance.','chart'],
  ['Rental Solutions','Fast, reliable tenant and rental-property matching.','key'],
  ['Legal & Documentation','Support with verification, transfer and transaction paperwork.','file'],
  ['Property Management','Keep your property performing with dependable management.','building']
];

const properties=[
  ['The Grand Family Residence','A refined 10 Marla family residence with contemporary interiors, generous living areas and premium finishes.','house','sale',28500000,'Canal Road, Gujranwala','10 Marla','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85',4,5],
  ['Executive Corner Plot','A high-value corner plot in a sought-after residential pocket, ideal for a custom-built home.','plot','sale',17500000,'Sialkot Road, Gujranwala','10 Marla','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=85',null,null],
  ['Prime Commercial Front','High-visibility commercial space suited to retail, office or investment use.','commercial','sale',9500000,'Main Market, Gujranwala','450 Sq Ft','https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&q=85',null,null],
  ['Modern 5 Marla Home','Move-in-ready modern home designed for comfortable family living and everyday convenience.','house','sale',19800000,'Central City, Gujranwala','5 Marla','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1400&q=85',3,4]
];

export async function seed() {
  await connectDB();
  const email=(process.env.ADMIN_EMAIL||'admin@example.com').toLowerCase();
  const pass=process.env.ADMIN_PASSWORD||'ChangeMe123!';
  await Admin.findOneAndUpdate({email},{name:'Ahmad Wattoo',email,passwordHash:await bcrypt.hash(pass,12),role:'admin'},{upsert:true,new:true,setDefaultsOnInsert:true});
  if(await Service.countDocuments()===0) await Service.insertMany(services.map((x,i)=>({title:x[0],description:x[1],icon:x[2],order:i})));
  if(await Property.countDocuments()===0) await Property.insertMany(properties.map((x,i)=>({title:x[0],description:x[1],propertyType:x[2],listingType:x[3],price:x[4],currency:'PKR',location:x[5],city:'Gujranwala',area:x[6],featuredImage:x[7],images:[{url:x[7],caption:x[0]}],bedrooms:x[8],bathrooms:x[9],status:'published',featured:i<3,availability:'available',shortDescription:x[1]})));
  if(await Gallery.countDocuments()===0) await Gallery.insertMany([{title:'Canal Road Residence',description:'Contemporary family residence',image:{url:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&q=85'}},{title:'Modern Living',description:'Premium interior detail',image:{url:'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1400&q=85'}},{title:'Executive Exterior',description:'Architectural detail',image:{url:'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=85'}}]);
  if(await Review.countDocuments()===0) await Review.insertMany([{name:'Ali Hassan',role:'Property Buyer',text:'The process was transparent from the first viewing to the final paperwork. Excellent local knowledge.',rating:5},{name:'Sara Ahmed',role:'Property Investor',text:'Their investment guidance helped me shortlist opportunities with a clear understanding of the upside and risks.',rating:5},{name:'Muhammad Usman',role:'Property Seller',text:'Professional marketing, serious buyers and regular updates. A very smooth selling experience.',rating:5}]);
  if(await FAQ.countDocuments()===0) await FAQ.insertMany([{question:'What areas do you cover?',answer:'We primarily serve Gujranwala, Sialkot Road and surrounding premium housing societies.'},{question:'Do you deal in commercial property?',answer:'Yes. We handle residential plots, homes, apartments, shops, offices and investment opportunities.'},{question:'How do I schedule a viewing?',answer:'Use the enquiry form, call our office or message us on WhatsApp and our team will arrange a suitable time.'},{question:'Are properties verified?',answer:'We encourage document verification and guide clients through ownership and transaction checks before proceeding.'}]);
  const website={name:'Ahmad Wattoo Real Estate',tagline:'Exceptional property guidance in Gujranwala',description:'A premium real estate advisory and brokerage focused on verified property opportunities, transparent transactions and long-term client relationships.',phone:'+92 302 1001860',phoneDisplay:'0302-1001860',whatsapp:'923021001860',email:'info@ahmadwattoorealestate.com',address:'23-B, Main Boulevard Commercial, Sialkot Road, Gujranwala, Pakistan',city:'Gujranwala',province:'Punjab',country:'Pakistan'};
  for(const [key,value] of Object.entries(website)) await Setting.findOneAndUpdate({group:'website',key},{group:'website',key,value},{upsert:true});
  console.log(`Seed complete. Admin: ${email} / ${pass}`);
}

const isDirect = process.argv[1] && process.argv[1].endsWith(new URL(import.meta.url).pathname.split('/').pop());
if (isDirect) {
  seed().then(() => process.exit(0)).catch((e) => {
    if (process.env.VERCEL) {
      console.warn('Seed did not run (non-fatal during Vercel build): ' + e.message);
      process.exit(0);
    }
    console.error(e);
    process.exit(1);
  });
}