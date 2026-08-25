const Task = require('../models/Task');
const { getAuthUserId } = require('../middleware/authMiddleware');

// Get Logged-In User's Tasks
const getTasks = async (req, res) => {
  try {
    const userId = getAuthUserId(req, res);
    if (!userId) return; // Response sent inside getAuthUserId

    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create Task
const createTask = async (req, res) => {
  try {
    const userId = getAuthUserId(req, res);
    if (!userId) return;

    const { title, description, priority } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      priority: priority || 'Medium',
      user: userId
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Task (with Strict User Isolation)
const updateTask = async (req, res) => {
  try {
    const userId = getAuthUserId(req, res);
    if (!userId) return;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Strict ownership verification
    if (task.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Task (with Strict User Isolation)
const deleteTask = async (req, res) => {
  try {
    const userId = getAuthUserId(req, res);
    if (!userId) return;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };