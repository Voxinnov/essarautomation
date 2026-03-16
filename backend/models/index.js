const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Hospital = require('./Hospital');
const Doctor = require('./Doctor');
const Task = require('./Task');
const WorkUpdate = require('./WorkUpdate');
const TimeLog = require('./TimeLog');
const Billing = require('./Billing');
const Expense = require('./Expense');
const Remark = require('./Remark');

// Hospital - Doctor
Hospital.hasMany(Doctor, { foreignKey: 'hospital_id', as: 'doctors' });
Doctor.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
User.hasMany(Hospital, { foreignKey: 'created_by', as: 'hospitals' });
Hospital.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Task associations
Client.hasMany(Task, { foreignKey: 'client_id', as: 'tasks' });
Task.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

Hospital.hasMany(Task, { foreignKey: 'hospital_id', as: 'tasks' });
Task.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

Doctor.hasMany(Task, { foreignKey: 'doctor_id', as: 'tasks' });
Task.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

User.hasMany(Task, { foreignKey: 'assigned_to', as: 'assigned_tasks' });
Task.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

User.hasMany(Task, { foreignKey: 'created_by', as: 'created_tasks' });
Task.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// WorkUpdate associations
Task.hasMany(WorkUpdate, { foreignKey: 'task_id', as: 'work_updates' });
WorkUpdate.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
User.hasMany(WorkUpdate, { foreignKey: 'updated_by', as: 'work_updates' });
WorkUpdate.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

// TimeLog associations
Task.hasMany(TimeLog, { foreignKey: 'task_id', as: 'time_logs' });
TimeLog.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
User.hasMany(TimeLog, { foreignKey: 'user_id', as: 'time_logs' });
TimeLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Billing associations
Task.hasMany(Billing, { foreignKey: 'task_id', as: 'billings' });
Billing.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
Client.hasMany(Billing, { foreignKey: 'client_id', as: 'billings' });
Billing.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

// Expense associations
User.hasMany(Expense, { foreignKey: 'created_by', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Remark associations
Task.hasMany(Remark, { foreignKey: 'task_id', as: 'remarks' });
Remark.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
User.hasMany(Remark, { foreignKey: 'user_id', as: 'remarks' });
Remark.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
    sequelize,
    User,
    Client,
    Hospital,
    Doctor,
    Task,
    WorkUpdate,
    TimeLog,
    Billing,
    Expense,
    Remark,
};
