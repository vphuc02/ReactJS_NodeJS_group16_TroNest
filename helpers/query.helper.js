const { AppError } = require('./error.helper');

const queryText = (value, maxLength = 200) => {
  if (value === undefined) return '';
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new AppError(400, 'Tham số tìm kiếm không hợp lệ!');
  }
  return value.trim();
};

const queryPage = (value) => {
  if (value === undefined || value === '') return 1;
  if (typeof value !== 'string' || !/^[1-9]\d{0,5}$/.test(value)) {
    throw new AppError(400, 'Số trang phải là số nguyên dương hợp lệ!');
  }
  return Number(value);
};

const pagination = (total, requestedPage, limit = 20) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(requestedPage, totalPages);
  return { total, totalPages, currentPage, limit, skip: (currentPage - 1) * limit };
};

module.exports = { queryText, queryPage, pagination };
