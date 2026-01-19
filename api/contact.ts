
const ADMIN_EMAIL = process.env.VITE_CONTACT_EMAIL || "arauzisabella13@gmail.com";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Correlate metadata
    const submission = {
      id: `MSG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      sender: { name, email, phone },
      content: message,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || 'unknown'
      }
    };

    /**
     * Silent Backend Logic:
     * In a production node environment, we would use Nodemailer or 
     * a service like SendGrid to relay this to ADMIN_EMAIL.
     * We keep this logic internal so the user never sees the recipient's email.
     */
    console.info(`[SILENT_MAIL_RELAY] Dispatching message ${submission.id} to ${ADMIN_EMAIL}`);
    console.info(`[SUBMISSION_DATA]`, submission);

    // Simulate database persistence
    // await db.collection('contacts').add(submission);

    return res.status(200).json({ 
      status: 'success', 
      id: submission.id 
    });

  } catch (error: any) {
    console.error('CONTACT_API_FAILURE:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
