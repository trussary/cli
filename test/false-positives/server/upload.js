// An upload with limits stated in the code.
const multer = require('multer');

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, ['image/png', 'image/jpeg'].includes(file.mimetype)),
});

module.exports = { upload };
