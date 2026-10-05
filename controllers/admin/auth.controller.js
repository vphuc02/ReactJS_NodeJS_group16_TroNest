// [GET] /admin/login
module.exports.loginGet = (req, res) => {
  if (req.user && req.user.role === 'ADMIN') {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/pages/login', {
    title: 'Đăng nhập Quản trị viên - TroNest'
  });
};

// [GET] /admin/logout
module.exports.logoutGet = (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin/login');
};
