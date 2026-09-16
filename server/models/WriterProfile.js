const mongoose = require('mongoose');
const { WRITER_STATUS } = require('../config/constants');

const writerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(WRITER_STATUS),
      default: WRITER_STATUS.PENDING,
      index: true,
    },
    pricePerPage: { type: Number, required: true, min: 0 },
    pricePerDiagram: { type: Number, required: true, min: 0 },
    upiId: { type: String, required: true, trim: true },
    upiQrCodeUrl: { type: String, required: true },
    bio: { type: String, required: true, maxlength: 1000 },
    serviceDescription: { type: String, required: true, maxlength: 2000 },
    isAvailable: { type: Boolean, default: true },
    rejectionReason: { type: String, default: '' },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    approvedAt: { type: Date },
    blockedAt: { type: Date },
  },
  { timestamps: true }
);

// Denormalized copies of location for fast matching queries without a $lookup.
// Kept in sync from the linked User document by services/writerService.js.
writerProfileSchema.add({
  state: { type: String, index: true },
  district: { type: String, index: true },
  city: { type: String, index: true },
});

writerProfileSchema.index({ state: 1, district: 1, city: 1, status: 1, isAvailable: 1 });

module.exports = mongoose.model('WriterProfile', writerProfileSchema);
