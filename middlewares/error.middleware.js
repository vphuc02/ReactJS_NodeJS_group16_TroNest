const notFoundHandler = (req, res) => {
  const isAdmin = req.originalUrl?.startsWith('/admin');
  const message = isAdmin
    ? '404 Not Found - Tài nguyên quản trị không tồn tại hoặc đã được chuyển hướng!'
    : '404 - Không tìm thấy trang hoặc tài nguyên không tồn tại hoặc đã được chuyển hướng!';

  return res.status(404).json({
    code: 404,
    message
  });
};

const errorHandler = (error, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  if (res.headersSent) {
    return next(error);
  }

  const requestedStatus = error.statusCode || error.status;
  let statusCode =
    Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus <= 599
      ? requestedStatus
      : 500;
  let message = error.publicMessage || 'Đã xảy ra lỗi máy chủ, vui lòng thử lại sau.';

  if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Dữ liệu JSON không hợp lệ!';
  } else if (error.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Dữ liệu gửi lên vượt quá dung lượng cho phép!';
  } else if (error.name === 'CastError') {
    statusCode = 404;
    message = 'Không tìm thấy dữ liệu yêu cầu hoặc định dạng định danh không hợp lệ!';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message =
      Object.values(error.errors || {})
        .map((err) => err.message)
        .join(', ') || 'Dữ liệu không hợp lệ!';
  } else if (error.code === 11000) {
    statusCode = 400;
    message = 'Dữ liệu này đã tồn tại trong hệ thống!';
  }

  return res.status(statusCode).json({
    code: statusCode,
    message
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
