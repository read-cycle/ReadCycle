function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMetaRows(rows: Array<{ label: string; value: string | null | undefined }>) {
  const visibleRows = rows.filter((row) => row.value && String(row.value).trim());

  if (!visibleRows.length) return '';

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;margin-top:24px;background:#f3fcfa;border:1px solid #cfeee6;border-radius:16px;overflow:hidden;">
      ${visibleRows
        .map(
          (row) => `
            <tr>
              <td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1c6758;width:34%;border-bottom:1px solid #cfeee6;">${escapeHtml(row.label)}</td>
              <td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:13px;color:#355f56;border-bottom:1px solid #cfeee6;">${escapeHtml(String(row.value))}</td>
            </tr>
          `
        )
        .join('')}
    </table>
  `;
}

export function createEmailLayout(options: {
  eyebrow?: string;
  title: string;
  intro: string;
  bodyHtml: string;
  metaRows?: Array<{ label: string; value: string | null | undefined }>;
  footer?: string;
}) {
  const footer = options.footer ?? 'ReadCycle helps students and families keep books in circulation.';

  return `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;padding:32px 16px;background:#eaf8f4;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
          <tr>
            <td align="center">
              <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;border-collapse:collapse;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(28,103,88,0.14);">
                <tr>
                  <td style="padding:32px 32px 20px;background:linear-gradient(135deg,#26e5bc 0%,#1c6758 100%);">
                    <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.8);margin-bottom:12px;">${escapeHtml(options.eyebrow ?? 'ReadCycle')}</div>
                    <div style="font-family:Arial,sans-serif;font-size:30px;line-height:1.15;font-weight:700;color:#ffffff;">${escapeHtml(options.title)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:16px;line-height:1.7;color:#355f56;">${escapeHtml(options.intro)}</p>
                    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#4e6f67;">
                      ${options.bodyHtml}
                    </div>
                    ${renderMetaRows(options.metaRows ?? [])}
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 32px 32px;border-top:1px solid #cfeee6;">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#65837c;">${escapeHtml(footer)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export function createBookRequestEmail(options: {
  requesterName: string;
  title: string;
  buyerQuantity: number;
  grade?: string | null;
  subject?: string | null;
  price?: number | null;
}) {
  return createEmailLayout({
    eyebrow: 'New Request',
    title: 'Someone wants your book',
    intro: `${options.requesterName} has requested one of your listings on ReadCycle.`,
    bodyHtml: `
      <p style="margin:0 0 12px;">Open ReadCycle to review the request, compare details, and decide whether you want to accept it.</p>
      <p style="margin:0;">If you accept, the request will move into chat so both users can coordinate the exchange.</p>
    `,
    metaRows: [
      { label: 'Book', value: options.title },
      { label: 'Requested Quantity', value: String(options.buyerQuantity) },
      { label: 'Grade', value: options.grade },
      { label: 'Subject', value: options.subject },
      { label: 'Listed Price', value: options.price != null ? `₹${options.price}` : null }
    ]
  });
}

export function createRequestAcceptedEmail(options: {
  title: string;
  buyerQuantity: number;
  uploaderName?: string | null;
  grade?: string | null;
  subject?: string | null;
}) {
  return createEmailLayout({
    eyebrow: 'Request Accepted',
    title: 'Your request was approved',
    intro: `Good news. Your ReadCycle request has been accepted.`,
    bodyHtml: `
      <p style="margin:0 0 12px;">You can now open the Chats page in ReadCycle to coordinate the handoff and confirm the exchange details.</p>
      <p style="margin:0;">Reply promptly so the exchange stays easy for both sides.</p>
    `,
    metaRows: [
      { label: 'Book', value: options.title },
      { label: 'Quantity', value: String(options.buyerQuantity) },
      { label: 'Uploader', value: options.uploaderName },
      { label: 'Grade', value: options.grade },
      { label: 'Subject', value: options.subject }
    ]
  });
}

export function createWatchlistMatchEmail(options: {
  title: string;
  grade?: string | null;
  subject?: string | null;
  quantity?: number | null;
  price?: number | null;
}) {
  return createEmailLayout({
    eyebrow: 'Watchlist Match',
    title: 'A book from your watchlist is available',
    intro: `A matching listing just appeared on ReadCycle.`,
    bodyHtml: `
      <p style="margin:0 0 12px;">If you still need this book, head to Browse and send a request before the available copies are gone.</p>
      <p style="margin:0;">Listings can change quickly as other users request them.</p>
    `,
    metaRows: [
      { label: 'Book', value: options.title },
      { label: 'Grade', value: options.grade },
      { label: 'Subject', value: options.subject },
      { label: 'Available Quantity', value: options.quantity != null ? String(options.quantity) : null },
      { label: 'Price', value: options.price != null ? `₹${options.price}` : null }
    ]
  });
}

export function createContactFormEmail(options: {
  name: string;
  grade: string;
  email: string;
  message: string;
}) {
  return createEmailLayout({
    eyebrow: 'Contact Form',
    title: 'New message from the website',
    intro: `${options.name} sent a new message through the ReadCycle contact form.`,
    bodyHtml: `
      <div style="padding:16px 18px;background:#f3fcfa;border:1px solid #cfeee6;border-radius:16px;white-space:pre-wrap;">${escapeHtml(options.message)}</div>
    `,
    metaRows: [
      { label: 'Name', value: options.name },
      { label: 'Grade / Class', value: options.grade },
      { label: 'Reply Email', value: options.email }
    ],
    footer: 'This message was submitted from the ReadCycle landing page contact form.'
  });
}
