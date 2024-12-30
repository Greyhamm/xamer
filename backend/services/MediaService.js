const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class MediaService {
  constructor(uploadDir = 'uploads') {
    this.uploadDir = uploadDir;
    this.ensureUploadDirectory();
  }

  async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file) {
    const extension = path.extname(file.originalname);
    const filename = `${uuidv4()}${extension}`;
    const filepath = path.join(this.uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);
    return {
      name: file.originalname,
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      url: `/uploads/${filename}`
    };
  }

  async deleteFile(filename) {
    const filepath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filepath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new MediaService();