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
const Brand = require('./Brand');
const Category = require('./Category');
const Product = require('./Product');
const StockTransaction = require('./StockTransaction');
const Role = require('./Role');
const Status = require('./Status');
const BankAccount = require('./BankAccount');
const TaskProduct = require('./TaskProduct');
const ProformaInvoice = require('./ProformaInvoice');
const ProformaInvoiceItem = require('./ProformaInvoiceItem');
const CompanyProfile = require('./CompanyProfile');


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

// Task Product associations
Task.hasMany(TaskProduct, { foreignKey: 'task_id', as: 'task_products' });
TaskProduct.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

Product.hasMany(TaskProduct, { foreignKey: 'product_id', as: 'task_products' });
TaskProduct.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
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

BankAccount.hasMany(Billing, { foreignKey: 'bank_account_id', as: 'billings' });
Billing.belongsTo(BankAccount, { foreignKey: 'bank_account_id', as: 'bank_account' });

// Expense associations
User.hasMany(Expense, { foreignKey: 'created_by', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Remark associations
Task.hasMany(Remark, { foreignKey: 'task_id', as: 'remarks' });
Remark.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });
User.hasMany(Remark, { foreignKey: 'user_id', as: 'remarks' });
Remark.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Stock Management associations
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Product.hasMany(StockTransaction, { foreignKey: 'product_id', as: 'transactions' });
StockTransaction.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

User.hasMany(StockTransaction, { foreignKey: 'user_id', as: 'stock_transactions' });
StockTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Role associations
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'roleData' });

// Proforma Invoice associations
Client.hasMany(ProformaInvoice, { foreignKey: 'client_id', as: 'proforma_invoices' });
ProformaInvoice.belongsTo(Client, { foreignKey: 'client_id', as: 'client' });

BankAccount.hasMany(ProformaInvoice, { foreignKey: 'bank_account_id', as: 'proforma_invoices' });
ProformaInvoice.belongsTo(BankAccount, { foreignKey: 'bank_account_id', as: 'bank_account' });

User.hasMany(ProformaInvoice, { foreignKey: 'created_by', as: 'proforma_invoices' });
ProformaInvoice.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

ProformaInvoice.hasMany(ProformaInvoiceItem, { foreignKey: 'proforma_invoice_id', as: 'items', onDelete: 'CASCADE' });
ProformaInvoiceItem.belongsTo(ProformaInvoice, { foreignKey: 'proforma_invoice_id', as: 'proforma_invoice' });

Product.hasMany(ProformaInvoiceItem, { foreignKey: 'product_id', as: 'proforma_items' });
ProformaInvoiceItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });


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
    Brand,
    Category,
    Product,
    StockTransaction,
    Role,
    Status,
    BankAccount,
    TaskProduct,
    ProformaInvoice,
    ProformaInvoiceItem,
    CompanyProfile,
};
