export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.status && err.status < 500 ? err.message : 'Something unexpected went wrong',
  });
};
