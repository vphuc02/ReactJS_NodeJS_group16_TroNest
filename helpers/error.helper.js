class AppError extends Error {
  constructor(statusCode, publicMessage) {
    super(publicMessage);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.publicMessage = publicMessage;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const notFound = (message = 'Không tìm thấy dữ liệu yêu cầu!') => new AppError(404, message);
const badRequest = (message = 'Yêu cầu không hợp lệ!') => new AppError(400, message);
const forbidden = (message = 'Bạn không có quyền thực hiện thao tác này!') => new AppError(403, message);
const unauthorized = (message = 'Vui lòng đăng nhập để tiếp tục!') => new AppError(401, message);

module.exports = {
  AppError,
  badRequest,
  forbidden,
  notFound,
  unauthorized
};
