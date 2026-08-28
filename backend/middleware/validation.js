/**
 * Validate incoming contact / request-access form submissions.
 * Rejects with 400 if required fields are missing or malformed.
 */
function validateContactBody(req, res, next) {
  const { person_name, contact_number, email, query } = req.body;
  const errors = [];

  if (!person_name || !person_name.trim())       errors.push('Person name is required.');
  if (!contact_number || !contact_number.trim())  errors.push('Contact number is required.');
  if (!email || !email.trim())                    errors.push('Email is required.');
  if (!query || !query.trim())                    errors.push('Message / query is required.');

  // Basic email format check
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Email format is invalid.');
  }

  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  next();
}

module.exports = { validateContactBody };
