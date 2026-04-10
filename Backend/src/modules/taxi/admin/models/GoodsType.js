import mongoose from 'mongoose';

const goodsTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    goods_type_for: {
      type: String,
      default: 'all',
      trim: true,
    },
    status: {
      type: String,
      default: 'active',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

goodsTypeSchema.index({ name: 1 });
goodsTypeSchema.index({ goods_type_for: 1, status: 1 });

export const GoodsType = mongoose.models.GoodsType || mongoose.model('GoodsType', goodsTypeSchema);
