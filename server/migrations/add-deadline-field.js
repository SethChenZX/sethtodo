import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const todoSchema = new mongoose.Schema({
  deadline: Date,
  reminderSent: Boolean
}, { strict: false });

const Todo = mongoose.model('Todo', todoSchema);

async function migrateDeadlines() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const todosWithoutDeadline = await Todo.find({ deadline: { $exists: false } });
    console.log(`Found ${todosWithoutDeadline.length} todos without deadline`);

    for (const todo of todosWithoutDeadline) {
      const created = new Date(todo.createdAt);
      created.setHours(23, 59, 59, 999);
      
      todo.deadline = created;
      todo.reminderSent = false;
      await todo.save();
      console.log(`Updated todo: ${todo._id}`);
    }

    console.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateDeadlines();
