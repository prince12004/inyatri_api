const formatFieldName = (field) =>
  field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

// Express 5 exposes req.query/params/body as getter-only; merge in place instead of reassignment.
const mergeValidated = (target, value) => {
  if (!target || typeof target !== 'object') return;

  for (const key of Object.keys(target)) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) {
      delete target[key];
    }
  }

  Object.assign(target, value);
};

const validate = (schemas) => (req, res, next) => {
  const locations = ['body', 'query', 'params'];

  for (const loc of locations) {
    if (schemas[loc]) {
      const { error, value } = schemas[loc].validate(req[loc], {
        abortEarly: false,
        convert: true,
        errors: {
          wrap: { label: '' }
        }
      });

      if (error) {
        // Even though abortEarly: false collects all validation errors, we intentionally return only the first error
        // to keep client-facing error messages concise and maintain compatibility with existing frontend error handling.
        const errorDetail = error.details[0];
        let errorMessage = errorDetail.message;

        // Custom Joi errors
        if (errorDetail.type === 'any.custom') {
          errorMessage =
            errorDetail.context?.custom ||
            errorDetail.context?.message ||
            errorDetail.context?.error?.message ||
            errorMessage;
        }

        // Convert snake_case field to human readable
        if (errorDetail.path?.length) {
          const field = errorDetail.path.join('.');
          const readableField = formatFieldName(field);
          errorMessage = errorMessage.replace(field, readableField);
        }

        return res.status(200).json({
          code: 422,
          status: false,
          message: errorMessage,
          data: {}
        });
      }

      mergeValidated(req[loc], value);
    }
  }
  next();
};

export default validate;
