import { MailService } from '@sendgrid/mail';
import type { Registration } from '@shared/schema';

const mailService = new MailService();

// Initialize SendGrid only if API key is available
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  html: string;
}

async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('\n=== EMAIL DEMO MODE ===');
    console.log('📧 Email Details:');
    console.log(`To: ${params.to}`);
    console.log(`From: ${params.from}`);
    console.log(`Subject: ${params.subject}`);
    console.log('✅ Email sent successfully (Demo Mode)');
    console.log('======================\n');
    
    // Simulate email sending delay for realistic demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; // Return true for development/testing
  }

  try {
    await mailService.send(params);
    console.log(`✅ Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

function generateConfirmationEmail(registration: Registration): string {

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Summer Camp Registration Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
        .ticket { background: #f9f9f9; border: 2px dashed #8B4513; padding: 20px; margin: 20px 0; }
        .ticket-number { font-size: 24px; font-weight: bold; color: #8B4513; }
        .details { background: white; padding: 15px; border-left: 4px solid #8B4513; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🕉️ GokulDham Haveli Atlanta</h1>
          <h2>Build Our Future Summer Camp</h2>
          <p>Registration Confirmation</p>
        </div>

        <div class="ticket">
          <h3>E-Ticket Confirmation</h3>
          <div class="ticket-number">Ticket #: ${registration.registrationId}</div>
          <p><strong>Child:</strong> ${registration.childFirstName} ${registration.childLastName}</p>
          <p><strong>Status:</strong> Registration Confirmed</p>
        </div>

        <div class="details">
          <h3>Registration Details</h3>
          <p><strong>Program:</strong> GokulDham Temple Summer Camp</p>
          <p><strong>Session Dates:</strong> ${registration.sessionDates}</p>
          <p><strong>Child's Age:</strong> ${registration.age} years old</p>
          <p><strong>Grade Completing:</strong> ${registration.gradeCompleting}</p>
          <p><strong>Registration Fee:</strong> $${registration.registrationFee}</p>
          <p><strong>Payment Status:</strong> ${registration.paymentStatus}</p>
        </div>

        <div class="details">
          <h3>Important Information</h3>
          <ul>
            <li>Please save this email as your registration confirmation</li>
            <li>Your e-ticket number is: <strong>${registration.registrationId}</strong></li>
            <li>You can check your registration status using your ticket number and child's last name</li>
            <li>Contact us at shrinathjihaveliatlanta@gmail.com if you have any questions</li>
          </ul>
        </div>

        <div class="details">
          <h3>What to Bring</h3>
          <ul>
            <li>Lunch and snacks for your child</li>
            <li>Water bottle</li>
            <li>Comfortable clothing suitable for activities</li>
            <li>Any medications (properly labeled)</li>
          </ul>
        </div>

        <div class="footer">
          <p>Thank you for registering with GokulDham Haveli Atlanta's Build Our Future Summer Camp!</p>
          <p>🕉️ Building Character, Building Community, Building Our Future 🕉️</p>
          <p>GokulDham Haveli Atlanta<br>
          2397 Satellite Blvd, Buford, GA 30518<br>
          Phone: (770) 492-4346 | Email: shrinathjihaveliatlanta@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentReminderEmail(registration: Registration): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Reminder - Summer Camp Registration</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
        .content { background: white; padding: 20px; border-left: 4px solid #8B4513; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🕉️ GokulDham Haveli Atlanta</h1>
          <h2>Build Our Future Summer Camp</h2>
          <p>Payment Reminder</p>
        </div>

        <div class="content">
          <h3>Dear ${registration.parentGuardianName},</h3>
          <p>We hope this message finds you well. This is a friendly reminder regarding your child's summer camp registration.</p>
          
          <div class="urgent">
            <h4>Registration Details:</h4>
            <p><strong>Child:</strong> ${registration.childFirstName} ${registration.childLastName}</p>
            <p><strong>Ticket #:</strong> ${registration.registrationId}</p>
            <p><strong>Registration Fee:</strong> $${registration.registrationFee}</p>
            <p><strong>Payment Status:</strong> ${registration.paymentStatus}</p>
          </div>

          <p>To secure your child's spot in our summer camp, please complete the payment process at your earliest convenience.</p>
          
          <h4>Payment Options:</h4>
          <ul>
            <li>Online payment through our registration portal</li>
            <li>Visit us at: 2397 Satellite Blvd, Buford, GA 30518</li>
            <li>Call us at: (770) 492-4346</li>
          </ul>

          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
        </div>

        <div class="footer">
          <p>Thank you for choosing GokulDham Haveli Atlanta's Build Our Future Summer Camp!</p>
          <p>🕉️ Building Character, Building Community, Building Our Future 🕉️</p>
          <p>GokulDham Haveli Atlanta<br>
          2397 Satellite Blvd, Buford, GA 30518<br>
          Phone: (770) 492-4346 | Email: shrinathjihaveliatlanta@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendRegistrationConfirmation(registration: Registration): Promise<boolean> {
  const emailHtml = generateConfirmationEmail(registration);
  
  return await sendEmail({
    to: registration.parentEmail,
    from: 'shrinathjihaveliatlanta@gmail.com',
    subject: `Summer Camp Registration Confirmation - Ticket #${registration.registrationId}`,
    html: emailHtml
  });
}

export async function sendPaymentReminder(registration: Registration): Promise<boolean> {
  const emailHtml = generatePaymentReminderEmail(registration);
  
  return await sendEmail({
    to: registration.parentEmail,
    from: 'shrinathjihaveliatlanta@gmail.com',
    subject: `Payment Reminder - Summer Camp Registration #${registration.registrationId}`,
    html: emailHtml
  });
}

// Export functions for email preview in demo mode
export function getEmailPreview(registration: Registration, type: 'confirmation' | 'reminder'): { subject: string; html: string } {
  if (type === 'confirmation') {
    return {
      subject: `Summer Camp Registration Confirmation - Ticket #${registration.registrationId}`,
      html: generateConfirmationEmail(registration)
    };
  } else {
    return {
      subject: `Payment Reminder - Summer Camp Registration #${registration.registrationId}`,
      html: generatePaymentReminderEmail(registration)
    };
  }
}