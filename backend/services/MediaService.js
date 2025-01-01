const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class MediaService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
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

  getUploadPath() {
    return this.uploadDir;
  }
}

module.exports = new MediaService();