const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveRequest = sequelize.define('LeaveRequest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        field: 'user_id',
        references: { model: 'users', key: 'id' } 
    },
    leaveType: { 
        type: DataTypes.ENUM('casual', 'medical', 'emergency'), 
        allowNull: false,
        field: 'leave_type'
    },
    startDate: { 
        type: DataTypes.DATEONLY, 
        allowNull: false,
        field: 'start_date'
    },
    endDate: { 
        type: DataTypes.DATEONLY, 
        allowNull: false,
        field: 'end_date'
    },
    halfDay: { 
        type: DataTypes.ENUM('none', 'first_half', 'second_half'), 
        defaultValue: 'none',
        field: 'half_day'
    },
    totalDays: { 
        type: DataTypes.DECIMAL(5, 1), 
        allowNull: false,
        field: 'total_days'
    },
    reason: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    status: { 
        type: DataTypes.ENUM('pending', 'approved', 'rejected'), 
        defaultValue: 'pending' 
    },
    approvedBy: { 
        type: DataTypes.INTEGER, 
        field: 'approved_by',
        references: { model: 'users', key: 'id' } 
    },
    comment: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    }
}, { 
    tableName: 'leave_requests',
    underscored: true
});

module.exports = LeaveRequest;
