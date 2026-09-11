import mongoose from 'mongoose';

const materialContributionSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, 'Quantity is required'],
      trim: true,
    },
    estimatedValue: {
      type: Number,
      default: 0,
      min: [0, 'Estimated value cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Other',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Received', 'Pledged', 'Used'],
      default: 'Received',
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

// Index for query performance
materialContributionSchema.index({ year: 1, category: 1, status: 1 });

const MaterialContribution = mongoose.model('MaterialContribution', materialContributionSchema);
export default MaterialContribution;
