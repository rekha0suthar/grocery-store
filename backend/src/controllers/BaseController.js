export class BaseController {
  sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  sendError(res, message = 'Error', statusCode = 400, details = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(details && { details })
    });
  }

  sendValidationError(res, errors) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  sendNotFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message
    });
  }

  sendUnauthorized(res, message = 'Unauthorized') {
    return res.status(401).json({
      success: false,
      message
    });
  }

  sendForbidden(res, message = 'Forbidden') {
    return res.status(403).json({
      success: false,
      message
    });
  }

  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}
