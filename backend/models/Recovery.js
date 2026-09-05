import mongoose from 'mongoose';

const recoverySchema = new mongoose.Schema(
  {
    splitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Split',
      required: [true, 'Split ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Recovery amount is required'],
      min: [0.01, 'Recovery amount must be a positive number'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

recoverySchema.index({ splitId: 1 });

const Recovery = mongoose.model('Recovery', recoverySchema);
export default Recovery;
