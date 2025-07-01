const sanitizeHtml = require('sanitize-html');

/**
 * Sanitize specified fields in the request body.
 * @param {string[]} fields - The fields to sanitize.
 */
module.exports = function sanitizeBody(fields) {
  return function (req, res, next) {
    fields.forEach(field => {
      if (req.body[field]) {
        req.body[field] = sanitizeHtml(req.body[field], {
          allowedTags: [],            // No HTML tags allowed
          allowedAttributes: {},      // No attributes allowed
          disallowedTagsMode: 'discard'
        });
      }
    });
    next();
  };
};
