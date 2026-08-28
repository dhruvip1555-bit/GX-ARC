/**
 * Validate incoming contact / request-access form submissions.
 * Rejects with 400 if required fields are missing, malformed, or too long.
 */
function validateContactBody(req, res, next) {
  const { person_name, contact_number, email, query, company_name, website } = req.body;
  const errors = [];

  /* Honeypot — hidden field that real users never fill */
  if (website) {
    return res.status(400).json({ error: 'Spam detected.' });
  }

  /* Required fields */
  if (!person_name || !person_name.trim())       errors.push('Person name is required.');
  if (!contact_number || !contact_number.trim())  errors.push('Contact number is required.');
  if (!email || !email.trim())                    errors.push('Email is required.');
  if (!query || !query.trim())                    errors.push('Message / query is required.');

  /* Email format */
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Email format is invalid.');
  }

  /* Length limits */
  if (person_name && person_name.trim().length > 200)          errors.push('Name is too long (max 200 chars).');
  if (contact_number && contact_number.trim().length > 30)     errors.push('Contact number is too long (max 30 chars).');
  if (email && email.trim().length > 254)                      errors.push('Email is too long.');
  if (query && query.trim().length > 5000)                     errors.push('Message is too long (max 5000 chars).');
  if (company_name && company_name.trim().length > 200)        errors.push('Company name is too long (max 200 chars).');

  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  next();
}

module.exports = { validateContactBody };
