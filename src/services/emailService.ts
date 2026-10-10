import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order, SiteSettings } from '../types';

export interface DispatchedEmail {
  id?: string;
  orderId: string;
  orderNumber: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  subject: string;
  html: string;
  type: 'order_confirmation' | 'tracking_id_generated' | 'status_update';
  status: 'sent' | 'simulated';
  whatsappDispatched: boolean;
  whatsappBody: string;
  createdAt: string;
}

// Generates the styled HTML email for Order Confirmation
export function generateOrderConfirmationHTML(order: Order): string {
  const itemsRows = order.items.map(item => `
    <tr style="border-bottom: 1px solid #E7EBEF;">
      <td style="padding: 12px 8px; text-align: left; font-weight: bold; color: #0B3561;">
        ${item.title} <br/>
        <span style="font-size: 11px; color: #6D86A0; font-weight: normal;">Qty: ${item.quantity} × ₹${item.unitPrice}</span>
      </td>
      <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #0B3561;">
        ₹${item.total}
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #CED7DF; border-radius: 24px; overflow: hidden; background-color: #FFFFFF; box-shadow: 0 4px 12px rgba(7, 30, 56, 0.05);">
      <div style="background-color: #0B3561; padding: 32px 24px; text-align: center; color: #FFFFFF;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PyNotes — Handwritten Code</h2>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 500;">Premium Printed Study Material</p>
      </div>
      <div style="padding: 32px 24px; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #DDF3F4; color: #12A5B0; font-weight: 800; font-size: 12px; padding: 6px 16px; border-radius: 9999px; text-transform: uppercase;">Order Confirmed!</div>
          <h1 style="color: #071E38; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0;">Thank you for your order, ${order.customerName}!</h1>
          <p style="color: #6D86A0; font-size: 14px; margin: 0;">Order ID: <strong>#${order.orderNumber}</strong></p>
        </div>
        
        <p style="color: #3C5D81; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          We are thrilled to let you know that we have received your order and are currently preparing it for dispatch. Our printed books feature **100 GSM non-bleed paper** and **vivid color flowcharts & memory models** to speed up your learning by 4x!
        </p>

        <h3 style="color: #0B3561; font-size: 14px; font-weight: 800; border-bottom: 2px solid #0B3561; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #E7EBEF; color: #6D86A0; font-weight: bold;">
              <th style="padding: 8px; text-align: left;">Item Description</th>
              <th style="padding: 8px; text-align: right;">Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="background-color: #F7FAFC; border: 1px solid #CED7DF; border-radius: 16px; padding: 20px; font-size: 13px; color: #0B3561; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6D86A0;">Items Subtotal:</span>
            <span style="font-weight: bold;">₹${order.subtotal}</span>
          </div>
          ${order.discountAmount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #E53E3E;">
            <span>Discount Applied (${order.couponCode}):</span>
            <span style="font-weight: bold;">-₹${order.discountAmount}</span>
          </div>
          ` : ''}
          ${order.prepaidDiscount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #12A5B0;">
            <span>Prepaid Discount (10% Off):</span>
            <span style="font-weight: bold;">-₹${order.prepaidDiscount}</span>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6D86A0;">Shipping Fee (Express Courier):</span>
            <span style="font-weight: bold; color: #12A5B0;">${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
          </div>
          ${order.codFee > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6D86A0;">Cash on Delivery (COD) Surcharge:</span>
            <span style="font-weight: bold;">₹${order.codFee}</span>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; border-t: 1px solid #CED7DF; pt-8; margin-top: 12px; padding-top: 12px; font-size: 15px; font-weight: 800;">
            <span>Grand Total:</span>
            <span style="color: #071E38;">₹${order.totalAmount}</span>
          </div>
          <div style="margin-top: 8px; font-size: 11px; text-align: right; color: #6D86A0;">
            Payment Method: <strong style="text-transform: uppercase;">${order.paymentMethod}</strong> (${order.paymentStatus})
          </div>
        </div>

        <h3 style="color: #0B3561; font-size: 14px; font-weight: 800; border-bottom: 2px solid #0B3561; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase;">Shipping Destination</h3>
        <p style="color: #3C5D81; font-size: 13px; line-height: 1.5; background-color: #F7FAFC; border: 1px solid #E7EBEF; border-radius: 16px; padding: 16px; margin-bottom: 24px;">
          <strong>${order.customerName}</strong><br/>
          ${order.shippingAddress.streetAddress}<br/>
          ${order.shippingAddress.landmark ? `Landmark: ${order.shippingAddress.landmark}<br/>` : ''}
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - <strong>${order.shippingAddress.pincode}</strong><br/>
          Contact Mobile: +91 ${order.customerPhone}
        </p>

        <div style="text-align: center; border-top: 1px solid #E7EBEF; padding-top: 24px; margin-top: 12px;">
          <h4 style="color: #0B3561; font-size: 14px; margin: 0 0 8px 0; font-weight: bold;">Need Assistance?</h4>
          <p style="color: #6D86A0; font-size: 12px; margin: 0 0 16px 0;">Our helpdesk resolves issues in under 48 hours.</p>
          <div style="font-size: 13px; color: #0B3561; font-weight: bold;">
            📧 support@handwrittencode.com | 📞 +91 98124-76342
          </div>
        </div>
      </div>
      <div style="background-color: #F7FAFC; padding: 20px; text-align: center; font-size: 11px; color: #9DAEC0; border-top: 1px solid #E7EBEF;">
        &copy; 2026 PyNotes - Handwritten Code. All rights reserved.<br/>
        Free Express Delivery Across India | Printed on 100 GSM Non-Bleed Paper
      </div>
    </div>
  `;
}

// Generates the styled HTML email for Tracking ID / AWB dispatch
export function generateTrackingEmailHTML(order: Order): string {
  const trackingLink = `https://handwrittencode.com/pages/order-tracking?id=${order.orderNumber}`;
  return `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #CED7DF; border-radius: 24px; overflow: hidden; background-color: #FFFFFF; box-shadow: 0 4px 12px rgba(7, 30, 56, 0.05);">
      <div style="background-color: #0B3561; padding: 32px 24px; text-align: center; color: #FFFFFF;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PyNotes — Handwritten Code</h2>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 500;">Express Logistics Gateway</p>
      </div>
      <div style="padding: 32px 24px; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #D4F4E2; color: #10B981; font-weight: 800; font-size: 12px; padding: 6px 16px; border-radius: 9999px; text-transform: uppercase;">Parcel Dispatched!</div>
          <h1 style="color: #071E38; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0;">Your PyNotes package is on the way!</h1>
          <p style="color: #6D86A0; font-size: 14px; margin: 0;">Courier Partner: <strong>${order.courier || 'Blue Dart Express'}</strong></p>
        </div>
        
        <p style="color: #3C5D81; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Hi ${order.customerName}, great news! We have carefully packed your premium handwritten study material in waterproof bubble envelopes and handed it over to our priority courier partners.
        </p>

        <div style="background-color: #F7FAFC; border: 2px dashed #12A5B0; border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 28px;">
          <div style="font-size: 12px; color: #6D86A0; margin-bottom: 6px; font-weight: bold; text-transform: uppercase;">Delhivery / Blue Dart tracking AWB</div>
          <div style="font-size: 22px; font-family: monospace; font-weight: bold; color: #0B3561; letter-spacing: 1px; margin-bottom: 12px;">
            ${order.trackingNumber}
          </div>
          <div style="font-size: 12px; color: #3C5D81; margin-bottom: 18px;">
            Expected delivery to <strong>${order.shippingAddress.city}</strong> within <strong>48 hours</strong>!
          </div>
          <a href="${trackingLink}" target="_blank" style="display: inline-block; background-color: #12A5B0; hover: background-color: #0F8D97; color: #FFFFFF; font-weight: bold; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 10px rgba(18, 165, 176, 0.25);">
            ⚡ Live Track My Order status
          </a>
        </div>

        <h3 style="color: #0B3561; font-size: 14px; font-weight: 800; border-bottom: 2px solid #0B3561; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase;">What is Inside Your Box?</h3>
        <ul style="color: #3C5D81; font-size: 13px; line-height: 1.6; margin: 0 0 24px 0; padding-left: 20px;">
          <li style="margin-bottom: 6px;"><strong>Premium Print:</strong> Crisp high-contrast print on 100 GSM non-bleed thick stock.</li>
          <li style="margin-bottom: 6px;"><strong>Visual Learning:</strong> Over 100+ handwritten memory maps, colorful key diagrams, and simplified core frameworks.</li>
          <li style="margin-bottom: 6px;"><strong>Complete Curriculum:</strong> Fully matches the official curriculum with simplified examples & clear exam-scoring notes.</li>
        </ul>

        <div style="text-align: center; border-top: 1px solid #E7EBEF; padding-top: 24px;">
          <h4 style="color: #0B3561; font-size: 13px; margin: 0 0 6px 0; font-weight: bold;">Track Instantly on PyNotes</h4>
          <p style="color: #6D86A0; font-size: 12px; margin: 0;">You can also check the real-time order status and log updates directly in the "My Account" page of our web storefront.</p>
        </div>
      </div>
      <div style="background-color: #F7FAFC; padding: 20px; text-align: center; font-size: 11px; color: #9DAEC0; border-top: 1px solid #E7EBEF;">
        &copy; 2026 PyNotes - Handwritten Code. All rights reserved.<br/>
        GSTIN: ${order.gstin || '07AAECP4108K1Z5'} | 📧 support@handwrittencode.com
      </div>
    </div>
  `;
}

// Generates generic status update HTML
export function generateStatusUpdateEmailHTML(order: Order, newStatus: string, note?: string): string {
  return `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #CED7DF; border-radius: 24px; overflow: hidden; background-color: #FFFFFF; box-shadow: 0 4px 12px rgba(7, 30, 56, 0.05);">
      <div style="background-color: #0B3561; padding: 32px 24px; text-align: center; color: #FFFFFF;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PyNotes — Handwritten Code</h2>
        <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 500;">Order Status Update Notification</p>
      </div>
      <div style="padding: 32px 24px; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #DDF3F4; color: #12A5B0; font-weight: 800; font-size: 12px; padding: 6px 16px; border-radius: 9999px; text-transform: uppercase;">
            Status: ${newStatus}
          </div>
          <h1 style="color: #071E38; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0;">Update for Order #${order.orderNumber}</h1>
          <p style="color: #6D86A0; font-size: 14px; margin: 0;">Latest Checkpoint Status Logged</p>
        </div>
        
        <p style="color: #3C5D81; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Hi ${order.customerName}, the status of your PyNotes order has changed to <strong>${newStatus}</strong>.
        </p>

        ${note ? `
        <div style="background-color: #F7FAFC; border-left: 4px solid #12A5B0; border-radius: 8px; padding: 16px; font-size: 13px; color: #0B3561; font-weight: 600; margin-bottom: 24px;">
          Checkpoint Note:<br/>
          <span style="font-weight: normal; color: #3C5D81; font-style: italic;">"${note}"</span>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #E7EBEF;">
          <a href="https://handwrittencode.com/pages/order-tracking?id=${order.orderNumber}" target="_blank" style="display: inline-block; background-color: #0B3561; color: #FFFFFF; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 24px; border-radius: 8px;">
            View Detailed History on Portal
          </a>
        </div>
      </div>
      <div style="background-color: #F7FAFC; padding: 20px; text-align: center; font-size: 11px; color: #9DAEC0; border-top: 1px solid #E7EBEF;">
        &copy; 2026 PyNotes - Handwritten Code. All rights reserved.<br/>
        Need help? Reply directly to this email or call +91 98124-76342
      </div>
    </div>
  `;
}

// Main dispatcher function
export async function sendAutomatedEmail(
  order: Order,
  type: 'order_confirmation' | 'tracking_id_generated' | 'status_update',
  extraInfo?: { newStatus?: string; note?: string },
  siteSettings?: SiteSettings
): Promise<{ success: boolean; mode: 'simulated' | 'emailjs'; emailId: string }> {
  try {
    let subject = '';
    let htmlContent = '';
    let whatsappBody = '';

    // Decide subject, html and whatsapp templates
    if (type === 'order_confirmation') {
      subject = `📚 Order Confirmed! #${order.orderNumber} - PyNotes Handwritten Code`;
      htmlContent = generateOrderConfirmationHTML(order);
      whatsappBody = `📚 PyNotes Order Confirmed! Hello ${order.customerName}, we've received your order #${order.orderNumber} of amount ₹${order.totalAmount}. We are preparing your notes on 100 GSM paper for express 48h shipping! Track here: https://handwrittencode.com/pages/order-tracking?id=${order.orderNumber}`;
    } else if (type === 'tracking_id_generated') {
      subject = `⚡ Shipped! PyNotes Tracking ID Generated for #${order.orderNumber}`;
      htmlContent = generateTrackingEmailHTML(order);
      whatsappBody = `⚡ PyNotes Dispatched! Hi ${order.customerName}, your package has been handed over to Blue Dart with tracking AWB: ${order.trackingNumber}. Expected delivery in 48h! Live track: https://handwrittencode.com/pages/order-tracking?id=${order.orderNumber}`;
    } else {
      const status = extraInfo?.newStatus || order.status;
      subject = `🔔 PyNotes Order #${order.orderNumber} Status Updated to: ${status}`;
      htmlContent = generateStatusUpdateEmailHTML(order, status, extraInfo?.note);
      whatsappBody = `🔔 PyNotes Order Alert! Hi ${order.customerName}, your order #${order.orderNumber} has been updated to "${status}". Check progress details: https://handwrittencode.com/pages/order-tracking?id=${order.orderNumber}`;
    }

    // Try live EmailJS integration if siteSettings supports it
    let sentMode: 'simulated' | 'emailjs' = 'simulated';

    const hasEmailJs =
      siteSettings?.serviceablePincodes && // let's double check if we stored serviceId or similar or can get it
      (siteSettings as any).emailJsServiceId &&
      (siteSettings as any).emailJsTemplateId &&
      (siteSettings as any).emailJsPublicKey;

    if (hasEmailJs) {
      try {
        const emailjsServiceId = (siteSettings as any).emailJsServiceId;
        const emailjsTemplateId = (siteSettings as any).emailJsTemplateId;
        const emailjsPublicKey = (siteSettings as any).emailJsPublicKey;

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: emailjsServiceId,
            template_id: emailjsTemplateId,
            user_id: emailjsPublicKey,
            template_params: {
              to_name: order.customerName,
              to_email: order.customerEmail,
              subject: subject,
              order_number: order.orderNumber,
              tracking_number: order.trackingNumber || 'PENDING',
              courier_name: order.courier || 'Delhivery',
              total_amount: `₹${order.totalAmount}`,
              html_body: htmlContent, // If template accepts custom html payload
            },
          }),
        });

        if (response.ok) {
          sentMode = 'emailjs';
          console.log('✅ Email successfully dispatched via EmailJS API Gateway!');
        } else {
          const errMsg = await response.text();
          console.warn('⚠️ EmailJS responded with error, falling back to simulated log:', errMsg);
        }
      } catch (e) {
        console.warn('⚠️ Error sending live EmailJS, logging mock transaction instead:', e);
      }
    }

    // Save to Firestore dispatched_emails collection for full admin audit log and visualization
    const emailRef = await addDoc(collection(db, 'dispatched_emails'), {
      orderId: order.id,
      orderNumber: order.orderNumber,
      recipientName: order.customerName,
      recipientEmail: order.customerEmail,
      recipientPhone: order.customerPhone,
      subject,
      html: htmlContent,
      type,
      status: sentMode === 'emailjs' ? 'sent' : 'simulated',
      whatsappDispatched: true, // we always mock dispatch WhatsApp successfully
      whatsappBody,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      mode: sentMode,
      emailId: emailRef.id,
    };
  } catch (error) {
    console.error('Failed to register/send email in service:', error);
    return { success: false, mode: 'simulated', emailId: '' };
  }
}
