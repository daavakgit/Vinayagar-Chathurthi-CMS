import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema(
  {
    personName: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
    },
    amountGiven: {
      type: Number,
      required: [true, 'Amount given is required'],
      min: [0.01, 'Amount given must be a positive number'],
    },
    dateGiven: {
      type: Date,
      default: Date.now,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
  },
  {
    timestamps: true,
  }
);

splitSchema.index({ year: 1 });

const Split = mongoose.model('Split', splitSchema);
export default Split;
