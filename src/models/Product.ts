import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this product.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  price: {
    type: Number,
    required: [true, 'Please specify the price.'],
  },
  oldPrice: {
    type: Number,
    required: false,
  },
  category: {
    type: String,
    required: [true, 'Please specify a category.'],
  },
  stock: {
    type: Number,
    required: [true, 'Please specify stock quantity.'],
    default: 0,
  },
  image: {
    type: String,
    required: [true, 'Please provide an image url.'],
  },
  tag: {
    type: String,
    required: false,
    default: 'New'
  },
  tagColor: {
    type: String,
    required: false,
    default: 'bg-emerald-500'
  },
  status: {
    type: String,
    required: false,
    enum: ['active', 'draft', 'hidden'],
    default: 'active'
  }
}, {
  timestamps: true 
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
