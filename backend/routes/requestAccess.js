const express = require('express');
const router = express.Router();
const { validateContactBody } = require('../middleware/validation');
const { sendFormEmail } = require('../services/emailService');

/**
 * POST /api/request-access
 * Handles "Request Access" submissions.
 */
router.post('/', validateContactBody, async (req, res) => {
  try {
    const { person_name, contact_number, email, company_name, query, notify } = req.body;

    await sendFormEmail({
      subject:       'Request Access',
      personName:    person_name.trim(),
      contactNumber: contact_number.trim(),
      email:         email.trim(),
      companyName:   (company_name || '').trim(),
      query:         query.trim(),
      notify:        !!notify,
    });

    return res.json({ message: 'Request submitted successfully.' });
  } catch (err) {
    console.error('[request-access] email send failed:', err.message);
    return res.status(500).json({ error: 'Unable to send your request right now. Please try again later.' });
  }
});

module.exports = router;
