import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  status: "approved" | "rejected";
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, orderNumber, status, reason }: OrderNotificationRequest = await req.json();

    const isApproved = status === "approved";
    
    const subject = isApproved 
      ? `Order ${orderNumber} Confirmed - capital Furniture`
      : `Order ${orderNumber} Update - capital Furniture`;

    const htmlContent = isApproved
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #D4AF37, #C4A030); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #1a1a1a; margin: 0;">capital Furniture</h1>
            <p style="color: #1a1a1a; margin: 5px 0 0;">تراك للأثاث</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1a1a1a;">Payment Confirmed! ✓</h2>
            <p style="color: #333;">Dear ${customerName},</p>
            <p style="color: #333;">Great news! Your payment for order <strong>#${orderNumber}</strong> has been confirmed.</p>
            <p style="color: #333;">We are now processing your order and will notify you when it's ready for delivery.</p>
            <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
              <p style="margin: 0; color: #333;"><strong>Order Number:</strong> #${orderNumber}</p>
              <p style="margin: 5px 0 0; color: #333;"><strong>Status:</strong> Confirmed</p>
            </div>
            <p style="color: #333;">Thank you for choosing capital Furniture!</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Need help? Contact us on WhatsApp: +201060044708
            </p>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #D4AF37, #C4A030); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #1a1a1a; margin: 0;">capital Furniture</h1>
            <p style="color: #1a1a1a; margin: 5px 0 0;">تراك للأثاث</p>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1a1a1a;">Payment Update Required</h2>
            <p style="color: #333;">Dear ${customerName},</p>
            <p style="color: #333;">We were unable to verify your payment for order <strong>#${orderNumber}</strong>.</p>
            ${reason ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404;"><strong>Reason:</strong> ${reason}</p>
              </div>
            ` : ''}
            <p style="color: #333;">Please contact us via WhatsApp to resolve this issue and complete your order.</p>
            <a href="https://wa.me/201555731200" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">
              Contact on WhatsApp
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              WhatsApp: +201060044708
            </p>
          </div>
        </div>
      `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "capital Furniture <onboarding@resend.dev>",
        to: [customerEmail],
        subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`Resend API error: ${errorData}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
