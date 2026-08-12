import nodemailer from 'nodemailer';
export async function sendEnquiryEmails(enquiry){
  const requiredEnv = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL'];
  const missing = requiredEnv.filter((key) => !process.env[key] || process.env[key].includes('example.com'));
  if (missing.length) return {sent:false,reason:`Missing or placeholder env: ${missing.join(', ')}`};
  const transporter=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT||587)===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
  const from=process.env.MAIL_FROM||process.env.SMTP_USER;
  try {
    await transporter.sendMail({from,to:process.env.ADMIN_EMAIL,replyTo:enquiry.email,subject:`New ${enquiry.formType||'contact'} enquiry — ${enquiry.subject||'General Inquiry'}`,text:`Name: ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone}\nMessage: ${enquiry.message}`});
    if(enquiry.email) await transporter.sendMail({from,to:enquiry.email,subject:'We received your property enquiry',text:`Hi ${enquiry.name},\n\nThank you for contacting Ahmad Wattoo Real Estate. Our team will get back to you within 24 hours.\n\nRegards,\nAhmad Wattoo Real Estate`});
    return {sent:true};
  } catch (error) {
    console.error('Email send failed:', error.message);
    return {sent:false,reason: error.message};
  }
}
