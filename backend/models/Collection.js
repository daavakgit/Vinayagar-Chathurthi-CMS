import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Contributor name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['working', 'student', 'general_public'],
    },
    expectedAmount: {
      type: Number,
      default: null,
    },
    actualAmount: {
      type: Number,
      required: [true, 'Actual amount is required'],
      min: [0.01, 'Actual amount must be a positive number'],
    },
    paymentStatus: {
      type: String,
      enum: ['Received', 'Pending'],
      default: 'Received',
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
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
collectionSchema.index({ year: 1, category: 1, paymentStatus: 1 });

const Collection = mongoose.model('Collection', collectionSchema);
export default Collection;
