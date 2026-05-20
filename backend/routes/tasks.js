const express = require('express');
const router = express.Router();
const { getTasks, createTask, getTask, updateTask, deleteTask, getTaskOptions } = require('../controllers/taskController');
const { addTaskProduct, getTaskProducts } = require('../controllers/taskProductController');
const { protect, hasPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', hasPermission('tasks_view'), getTasks);
router.get('/options', hasPermission('tasks_view'), getTaskOptions);
router.post('/', hasPermission('tasks_create'), createTask);
router.get('/:id', hasPermission('tasks_view'), getTask);
router.get('/:task_id/products', hasPermission('tasks_view'), getTaskProducts);
router.post('/:task_id/products', hasPermission('tasks_edit'), addTaskProduct);
router.put('/:id', hasPermission('tasks_edit'), updateTask);
router.delete('/:id', hasPermission('tasks_delete'), deleteTask);

module.exports = router;
