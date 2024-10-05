const { DataTypes } = require('sequelize');
const connection = require('../database/db.connection');

const Tasks = connection.define('Tasks', {
    id: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(['to-do', 'in-progress','done', 'backlog']),
        allowNull: false,
        defaultValue: 'to-do'
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type :  DataTypes.DATE
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            key: 'id',
            model: 'Users'
        }
    }
});

module.exports = Tasks;