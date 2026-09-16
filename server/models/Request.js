const mongoose = require('mongoose');
const { REQUEST_STATUS, WORK_TYPES } = require('../config/constants');

const requestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    workType: { type: String, enum: Object.values(WORK_TYPES), required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 3000 },

    numberOfPages: { type: Number, required: true, min: 1 },
    numberOfDiagrams: { type: Number, default: 0, min: 0 },
    requiredDate: { type: Date, required: true },
    urgency: {
      type: String,
      enum: ['STANDARD', 'URGENT'],
      default: 'STANDARD',
    },

    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },

    budget: { type: Number, required: true, min: 0 },
    additionalInstructions: { type: String, default: '', maxlength: 1000 },
    referenceFiles: [{ url: String, publicId: String, originalName: String }],

    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
      index: true,
    },

    matchedWriters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    acceptedQuotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },

    completionProofFiles: [{ url: String, publicId: String, originalName: String }],
    writerMarkedCompleteAt: { type: Date },
    customerConfirmedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String, default: '' },
  },
  { timestamps: true }
);

requestSchema.index({ state: 1, district: 1, city: 1, status: 1 });
requestSchema.index({ customer: 1, status: 1 });
requestSchema.index({ writer: 1, status: 1 });

module.exports = mongoose.model('Request', requestSchema);
