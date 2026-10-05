const { wantsJson } = require('../helpers/http.helper');

const notFoundHandler = (req, res) => {
  const payload = {
    title: '404 - Không tìm thấy trang',
    message: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển hướng!'
  };

  if (wantsJson(req)) {
    return res.status(404).json({
      code: 404,
      message: payload.message
    });
  }

  if (req.originalUrl?.startsWith('/admin')) {
    return res.status(404).render('admin/pages/error-404', {
      title: payload.title
    });
  }

  return res.status(404).render('client/pages/error', payload);
};

const errorHandler = (error, req, res, _next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  if (res.headersSent) {
    return;
  }

  let statusCode = error.statusCode || 500;
  let message = error.publicMessage || 'Đã xảy ra lỗi máy chủ, vui lòng thử lại sau.';

  if (error.name === 'CastError') {
    statusCode = 404;
    message = 'Không tìm thấy dữ liệu yêu cầu hoặc định dạng định danh không hợp lệ!';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors || {})
      .map((err) => err.message)
      .join(', ') || 'Dữ liệu không hợp lệ!';
  } else if (error.code === 11000) {
    statusCode = 400;
    message = 'Dữ liệu này đã tồn tại trong hệ thống!';
  }

  if (wantsJson(req)) {
    return res.status(statusCode).json({
      code: statusCode,
      message
    });
  }

  if (req.originalUrl?.startsWith('/admin') && statusCode === 404) {
    return res.status(404).render('admin/pages/error-404', {
      title: '404 - Không tìm thấy trang'
    });
  }

  return res.status(statusCode).render('client/pages/error', {
    title: statusCode === 404 ? '404 - Không tìm thấy' : 'Thông báo lỗi',
    message
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
