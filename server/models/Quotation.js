const mongoose = require('mongoose');
const { QUOTATION_STATUS } = require('../config/constants');

const quotationSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true, index: true },
    writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    pricePerPage: { type: Number, required: true, min: 0 },
    pricePerDiagram: { type: Number, required: true, min: 0 },
    additionalCharges: { type: Number, default: 0, min: 0 },
    estimatedTotal: { type: Number, required: true, min: 0 },
    estimatedCompletionDate: { type: Date, required: true },
    message: { type: String, default: '', maxlength: 1000 },

    status: {
      type: String,
      enum: Object.values(QUOTATION_STATUS),
      default: QUOTATION_STATUS.PENDING,
      index: true,
    },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

quotationSchema.index({ request: 1, status: 1 });

module.exports = mongoose.model('Quotation', quotationSchema);
