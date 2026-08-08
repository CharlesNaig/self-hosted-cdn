// server/models/File.js
import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  storedName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mime: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  sha256: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: String,
    default: 'admin',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export default mongoose.model('File', fileSchema);
