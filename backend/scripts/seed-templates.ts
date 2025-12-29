import { getDb } from "../src/db/mongo";

const templates = [
  {
    slug: "otp",
    type: "email",
    title: "One-Time Passcode",
    subject: "Your verification code: {{code}}",
    body: `<div style="font-family:Arial,sans-serif;background:#0b1021;padding:24px;color:#e5e7eb;">
  <div style="max-width:520px;margin:0 auto;background:#0f172a;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
    <div style="padding:24px 24px 12px;">
      <p style="font-size:14px;color:#a5b4fc;margin:0 0 4px;">Secure login</p>
      <h1 style="font-size:22px;color:#fff;margin:0 0 16px;">Your one-time code</h1>
      <p style="font-size:15px;line-height:22px;color:#e5e7eb;margin:0 0 16px;">Hi {{name}}, use this code to complete your sign-in. It expires in 10 minutes.</p>
      <div style="margin:16px 0;padding:14px 18px;border:1px dashed #3b82f6;border-radius:12px;text-align:center;background:#0b152b;">
        <span style="font-size:24px;font-weight:700;letter-spacing:4px;color:#3b82f6;">{{code}}</span>
      </div>
      <p style="font-size:13px;color:#94a3b8;margin:0;">If you didn’t request this, you can ignore this email.</p>
    </div>
    <div style="background:#0b1324;padding:16px 24px;border-top:1px solid #1f2937;">
      <p style="font-size:12px;color:#64748b;margin:0;">ICE Exhibitions • Secure access</p>
    </div>
  </div>
</div>`,
    placeholders: ["name", "code"],
    description: "Email OTP template for user login verification.",
  },
  {
    slug: "contact-submitted",
    type: "email",
    title: "Contact Confirmation",
    subject: "We received your contact request",
    body: `<div style="font-family:Arial,sans-serif;background:#0b1021;padding:24px;color:#e5e7eb;">
  <div style="max-width:620px;margin:0 auto;background:#0f172a;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
    <div style="padding:24px;border-bottom:1px solid #1f2937;background:linear-gradient(135deg,#111827 0%,#0b1224 100%);">
      <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:#a5b4fc;">Contact</p>
      <h1 style="margin:0;font-size:24px;color:#fff;">Thanks for reaching out</h1>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">Hi {{name}},</p>
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">We received your note and will reply at <strong>{{email}}</strong>. Expect a response within one business day.</p>
      <div style="margin:16px 0;padding:12px 14px;border:1px solid #1f2937;border-radius:12px;background:#0b152b;">
        <p style="margin:0;font-size:13px;color:#cbd5e1;">Tip: If you have assets or deadlines, reply to this email and attach them so we can plan faster.</p>
      </div>
      <p style="font-size:15px;line-height:22px;margin:0 0 4px;">Thanks,</p>
      <p style="font-size:15px;line-height:22px;margin:0;">ICE Support</p>
    </div>
  </div>
</div>`,
    placeholders: ["name", "email"],
    formSlug: "contact",
    description: "Auto-response for contact form submissions.",
  },
  {
    slug: "partner-submitted",
    type: "email",
    title: "Partner Inquiry",
    subject: "Thanks for your partner inquiry",
    body: `<div style="font-family:Arial,sans-serif;background:#0b1021;padding:24px;color:#e5e7eb;">
  <div style="max-width:620px;margin:0 auto;background:#0f172a;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
    <div style="padding:24px;border-bottom:1px solid #1f2937;background:linear-gradient(135deg,#0f172a 0%,#0b1224 100%);">
      <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:#a5b4fc;">Partnership</p>
      <h1 style="margin:0;font-size:24px;color:#fff;">We got your partner inquiry</h1>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">Hi {{name}},</p>
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">Thanks for your interest in partnering with ICE Exhibitions. Our team will review your goals and get back with next steps.</p>
      <div style="margin:16px 0;padding:12px 14px;border:1px solid #1f2937;border-radius:12px;background:#0b152b;">
        <p style="margin:0;font-size:13px;color:#cbd5e1;">If you have timelines, budgets, or hero products to highlight, reply with details so we can tailor the plan.</p>
      </div>
      <p style="font-size:15px;line-height:22px;margin:0 0 4px;">Best,</p>
      <p style="font-size:15px;line-height:22px;margin:0;">Partnerships @ ICE</p>
    </div>
  </div>
</div>`,
    placeholders: ["name"],
    formSlug: "partner",
    description: "Response for partner inquiries.",
  },
  {
    slug: "sponsor-submitted",
    type: "email",
    title: "Sponsor Inquiry",
    subject: "Sponsorship inquiry received",
    body: `<div style="font-family:Arial,sans-serif;background:#0b1021;padding:24px;color:#e5e7eb;">
  <div style="max-width:620px;margin:0 auto;background:#0f172a;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
    <div style="padding:24px;border-bottom:1px solid #1f2937;background:linear-gradient(135deg,#0f172a 0%,#0b1224 100%);">
      <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:#a5b4fc;">Sponsorship</p>
      <h1 style="margin:0;font-size:24px;color:#fff;">Thanks for your sponsorship inquiry</h1>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">Hi {{name}},</p>
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">We appreciate your interest in sponsoring ICE. We’ll reach out to discuss packages, availability, and how to meet your objectives.</p>
      <div style="margin:16px 0;padding:12px 14px;border:1px solid #1f2937;border-radius:12px;background:#0b152b;">
        <p style="margin:0;font-size:13px;color:#cbd5e1;">Share your budget range and any must-have deliverables by replying to this email for a faster proposal.</p>
      </div>
      <p style="font-size:15px;line-height:22px;margin:0 0 4px;">Regards,</p>
      <p style="font-size:15px;line-height:22px;margin:0;">Sponsorships @ ICE</p>
    </div>
  </div>
</div>`,
    placeholders: ["name"],
    formSlug: "sponsor",
    description: "Response for sponsorship inquiries.",
  },
  {
    slug: "brand-guidelines",
    type: "email",
    title: "Brand Guidelines Request",
    subject: "Your brand guidelines request",
    body: `<div style="font-family:Arial,sans-serif;background:#0b1021;padding:24px;color:#e5e7eb;">
  <div style="max-width:620px;margin:0 auto;background:#0f172a;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
    <div style="padding:24px;border-bottom:1px solid #1f2937;background:linear-gradient(135deg,#0f172a 0%,#0b1224 100%);">
      <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:#a5b4fc;">Brand</p>
      <h1 style="margin:0;font-size:24px;color:#fff;">Your brand kit</h1>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">Hi {{name}},</p>
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">Here’s the link to download our brand guidelines:</p>
      <div style="margin:16px 0;padding:14px 16px;border:1px solid #3b82f6;border-radius:12px;background:#0b152b;">
        <a href="{{guidelines_link}}" style="color:#3b82f6;font-weight:600;text-decoration:none;">Open brand guidelines</a>
      </div>
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">If you need logos in other formats or additional assets, reply and we’ll send them over.</p>
      <p style="font-size:15px;line-height:22px;margin:0 0 4px;">Thanks,</p>
      <p style="font-size:15px;line-height:22px;margin:0;">ICE Brand Team</p>
    </div>
  </div>
</div>`,
    placeholders: ["name", "guidelines_link"],
    formSlug: "brand-guidelines",
    description: "Delivers brand guidelines link to requesters.",
  },
  {
    slug: "feedback-submitted",
    type: "email",
    title: "Feedback Thank You",
    subject: "Thanks for your feedback",
    body: `<div style="font-family:Arial,sans-serif;background:#0b1021;padding:24px;color:#e5e7eb;">
  <div style="max-width:620px;margin:0 auto;background:#0f172a;border:1px solid #1f2937;border-radius:16px;overflow:hidden;">
    <div style="padding:24px;border-bottom:1px solid #1f2937;background:linear-gradient(135deg,#0f172a 0%,#0b1224 100%);">
      <p style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.2em;color:#a5b4fc;">Feedback</p>
      <h1 style="margin:0;font-size:24px;color:#fff;">We appreciate your input</h1>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">Hi {{name}},</p>
      <p style="font-size:15px;line-height:22px;margin:0 0 12px;">Thanks for sharing feedback about ICE Exhibitions. We value your input and will use it to improve the next edition.</p>
      <p style="font-size:15px;line-height:22px;margin:0 0 4px;">Thanks,</p>
      <p style="font-size:15px;line-height:22px;margin:0;">ICE Team</p>
    </div>
  </div>
</div>`,
    placeholders: ["name"],
    formSlug: "feedback",
    description: "Acknowledges feedback submissions.",
  },
];

const run = async () => {
  try {
    const db = await getDb();
    const col = db.collection("templates");
    await col.deleteMany({});
    await col.insertMany(templates.map((t) => ({ ...t, createdAt: new Date(), updatedAt: new Date() })));
    console.log("Templates seed applied.");
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

run();
