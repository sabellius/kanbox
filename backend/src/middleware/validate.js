import createError from "http-errors";

export function validate(schemas) {
  return async (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error.name === "ZodError") {
        const messages = error.errors
          .map(err => {
            const field = err.path.join(".");
            return `${field}: ${err.message}`;
          })
          .join(", ");
        return next(createError(400, messages));
      }
      next(error);
    }
  };
}
