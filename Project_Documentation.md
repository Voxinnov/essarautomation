# Essar Automation - Project Documentation

## 1. Project Overview
Essar Automation is a comprehensive enterprise management system designed to streamline internal operations, including task tracking, client and hospital management, billing, expense tracking, and stock management. The platform features robust Role-Based Access Control (RBAC) to ensure appropriate data visibility and security.

**Tech Stack:**
- **Backend**: Node.js, Express.js
- **Database**: SQL (via Sequelize ORM)
- **Frontend**: React.js

---

## 2. Role Management & Access Control

The system implements a strict Role-Based Access Control (RBAC) architecture. There are three primary roles defined in the system:

### 2.1. Admin
- **Description**: Full system access.
- **Permissions**: 
  - View dashboard and overall metrics.
  - Full CRUD (Create, Read, Update, Delete) on Tasks, Clients, Hospitals, Doctors, Work Updates.
  - View and manage Time Tracking, Billing, Expenses, and Stock.
  - View system reports.
  - Manage system Settings, Roles, and Users.

### 2.2. Manager
- **Description**: Management access.
- **Permissions**:
  - View dashboard.
  - Create, Read, and Edit (but *not* delete) Tasks, Clients, Hospitals, Doctors, and Work Updates.
  - View Time Tracking, Billing, Expenses, Stock, and Reports.

### 2.3. Staff
- **Description**: Standard employee access.
- **Permissions**:
  - View dashboard.
  - View Tasks (typically assigned to them).
  - View and Create Work Updates.
  - View Time Tracking logs.

*Note: User passwords and authentication states are protected and automatically hashed using bcrypt (cost factor 12) before being saved to the database.*

---

## 3. Core Modules & Functionalities

### 3.1. User & Authentication Module
- **Registration/Login**: Users authenticate using their credentials.
- **Profile Management**: Stores user details including name, email, phone, role, and active/inactive status.
- **Role Assignment**: Users are assigned a specific `roleId` that strictly dictates their permissions across the entire application interface and API endpoints.

### 3.2. Task Management
- **Task Creation**: Tasks act as the central operational hub and can be optionally linked to a specific Client, Hospital, or Doctor.
- **Assignment**: Tasks are assigned to specific system users.
- **Attributes**:
  - **Status**: Pending, In Progress, Completed, On Hold.
  - **Priority**: Low, Medium, High, Urgent.
  - **Due Date**: Track task deadlines and turnaround times.
- **Tracking Features**:
  - **Work Updates**: Assigned users can post progressive status updates on the task.
  - **Remarks**: Additional comments or internal remarks can be appended to tasks.
  - **Time Logs**: Granular tracking of the total time spent by individual users on specific tasks.

### 3.3. CRM (Client, Hospital, & Doctor Management)
- **Clients**: Manage individual clients linked directly to tasks and billing systems.
- **Hospitals**: Hospitals can be created and managed by authorized users. They serve as parent entities for doctors and are directly linkable to tasks.
- **Doctors**: Doctors belong to a specific Hospital. Tasks can be created specifically targeted for doctors.

### 3.4. Billing & Invoicing
- **Invoice Generation**: Invoices are generated against completed tasks or for specific clients.
- **Billing Models**: Supports both Fixed and Hourly billing paradigms.
- **Key Features**:
  - Auto-generated, unique invoice numbers with customizable prefixes (e.g., `vox`).
  - Purchase Order (PO) number and date tracking.
  - Granular line items support (stored as JSON arrays including item name, unit, quantity, price, discount percentage, tax, and total).
  - Financial calculations handling Shipping Charges, Total Discounts, Custom Amounts, and Advance Payments.
  - Terms & conditions and private notes inclusion.
- **Status Lifecycle**: Pending -> Paid.

### 3.5. Expense Management
- **Expense Logging**: Users can log operational or internal expenses.
- **Attributes**: System strictly tracks the expense title, monetary amount, categorization, date incurred, and general notes. Automatically associates the logged expense to the creator.

### 3.6. Stock & Inventory Management
- **Catalog Hierarchy**: Products are logically categorized by **Brands** and **Categories**.
- **Product Details**: Extensive metadata tracking including product code, HSN code, sizing, units per box, MRP, PTR, PTS, PTD, and applicable Tax rates.
- **Inventory Tracking**: Continuously monitors `current_stock` and tracks against a defined `reorder_level` to maintain optimal inventory.
- **Transactions**: Every single movement in stock (inwards/outwards) is immutably recorded via the `StockTransaction` model, strictly linked to the user who executed the change and the product involved.

---

## 4. Relational Conditions & Database Schema Structure

The application's relational database strictly enforces data integrity through the following predefined conditions and associations:

- **Users**: Serve as the core entity. They create Tasks, Hospitals, Work Updates, Expenses, TimeLogs, and execute Stock Transactions.
- **Roles**: A One-to-Many relationship with Users (A single role dictates the permissions of many users).
- **Hospitals & Doctors**: A One-to-Many relationship (A hospital acts as an umbrella entity containing many doctors).
- **Tasks**: 
  - Belongs conditionally to one Client, Hospital, or Doctor.
  - Belongs to exactly one Assignee (User) and one Creator (User).
  - Contains Many Work Updates, Time Logs, Remarks, and Billings (One-to-Many).
- **Billing**: Strictly belongs to one Task and one Client.
- **Inventory**: Products belong to one Brand and one Category. A Product can have many historical Stock Transactions.
