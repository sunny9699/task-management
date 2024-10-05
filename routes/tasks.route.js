const express = require('express');
const taskRouter = express.Router();
const Tasks = require('../model/tasks.model');
const authenticateUser = require('../middleware/authentication.middleware');
const { body, validationResult, param, query } = require('express-validator');
const { Op } = require('sequelize');

// Create task
taskRouter.post('/', authenticateUser, [
    body('name').not().notEmpty({ ignore_whitespace: false }).withMessage('Invalid task name!'),
    body('due_date').not().notEmpty().isDate({
        format: 'MM/DD/YYYY'

    }).withMessage('Invalid due date!'),
], async (req, res) => {
    try {
        const user = req.user;
        const { due_date, name } = req.body;
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ status: 400, errors: validationErrors.array()[0].msg });
        }

        await Tasks.create({
            due_date,
            name,
            user_id: user.id
        });

        return res.status(200).json({
            message: 'Event created successfully!',
        });
    } catch (error) {
        console.log('error', error);
        return res.status(400).json({
            message: 'Something went wrong!',
        });
    }
});

taskRouter.put('/update-status/:id', authenticateUser, [
    param('id').not().notEmpty().withMessage('Task not found!'),
    body('status').notEmpty().isIn(['to-do', 'in-progress', 'done', 'backlog']).withMessage('Invalid status!'),
], async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ status: 400, errors: validationErrors.array()[0].msg });
        }
        const findTask = await Tasks.findOne({
            id: id,
            user_id: user.id
        });

        if (!findTask) {
            return res.status(400).json({
                message: 'Task not found!',
                status: 400
            });
        }

        await Tasks.update({
            status: req.body.status
        }, {
            where: {
                id: id
            }
        });
        return res.status(200).json({
            message: 'Task status changed successfully!',
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: 'Something went wrong!',
        });
    }
});

taskRouter.put('/:id', authenticateUser, [
    param('id').not().notEmpty().withMessage('Task not found!'),
    body('name').not().notEmpty({ ignore_whitespace: false }).withMessage('Invalid task name!'),
    body('due_date').not().notEmpty().isDate({
        format: 'MM/DD/YYYY'
    }).withMessage('Invalid due date!'),
], async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ status: 400, errors: validationErrors.array()[0].msg });
        }
        const { due_date, name } = req.body;

        const findTask = await Tasks.findOne({
            id: id,
            user_id: user.id
        });

        if (!findTask) {
            return res.status(400).json({
                message: 'Task not found!',
                status: 400
            });
        }

        await Tasks.update({
            due_date,
            name,
        }, {
            where: {
                id: id
            }
        });
        return res.status(200).json({
            message: 'Task updated successfully!',
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: 'Something went wrong!',
        });
    }
});

taskRouter.delete('/:id', authenticateUser, [
    param('id').not().notEmpty().withMessage('Task not found!')],
    async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.user;
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ status: 400, errors: validationErrors.array()[0].msg });
        }

        const findTask = await Tasks.findOne({
            id: id,
            user_id: user.id
        });

        if (!findTask) {
            return res.status(400).json({
                message: 'Task not found!',
                status: 400
            });
        }

        await Tasks.destroy({ where: {
            id: id,
            user_id: user.id
        } });
        return res.status(200).json({
            message: 'Task deleted successfully!',
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: 'Something went wrong!',
        });
    }
});

taskRouter.get('/', authenticateUser, [
    query('status').isIn(['to-do', 'in-progress', 'done', 'backlog']).withMessage('Invalid status!'),
    query('overDue').isNumeric().not().withMessage('Invalid overdue value!'),
], async (req, res) => {
    try {
        const user = req.user;
        const { status, overDue } = req.query;
        console.log(overDue);
        
        const validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ status: 400, errors: validationErrors.array()[0].msg });
        }

        const findTasks = await Tasks.findAll({
            where: {
                user_id: user.id,
                ...(status && !overDue && { status }),
                ...(overDue && { status: {[Op.in] : ['in-progress', 'to-do', 'backlog']}, due_date: { [Op.lt]: new Date() } })
            }
        });
        return res.status(200).json(findTasks);
    } catch (error) {
        console.log(error);
        
        return res.status(400).json({
            message: 'Something went wrong!',
        });
    }
})

module.exports = taskRouter;