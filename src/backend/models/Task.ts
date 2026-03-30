import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  importance: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  urgency: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  estimatedTime: {
    type: Number,
    required: true,
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'done', 'skipped'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
