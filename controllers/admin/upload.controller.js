module.exports.imagePost = (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      message: 'Không có tệp ảnh nào được tải lên!'
    });
  }

  const location = req.file.path || req.file.secure_url || req.file.url;
  return res.json({
    code: 200,
    location: location,
    url: location
  });
};

