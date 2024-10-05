const express = require('express');
const userRouter = express.Router();
const Users = require('../model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Register user route
userRouter.post('/register', body('email').isEmail().not().notEmpty({ ignore_whitespace: false }).withMessage('Invalid email!'), body('firstName').isString().not().notEmpty({ ignore_whitespace: false }).withMessage('First name is required!'), body('lastName').isString().not().notEmpty({ ignore_whitespace: false }).withMessage('Last name is required!'),
    body('password').isString().not().notEmpty().withMessage('Password is required!'), async (req, res) => {
        try {
            const validationErrors = validationResult(req);
            if(!validationErrors.isEmpty()){
                return res.status(400).json({status: 400, errors: validationErrors.array()[0].msg});
            }
            const { firstName, lastName, password, email } = req.body;

            if (!firstName || !lastName || !password || !email) {
                return res.status(400).json({
                    message: 'All fields are required'
                });
            }
            const findUser = await Users.findOne({
                where: {
                    email
                }
            });

            if (findUser) {
                return res.status(400).json({
                    message: "User already exists!"
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt)

            await Users.create({
                firstName,
                lastName,
                password: hashPassword,
                email
            });

            return res.status(200).json({
                message: "User registered successfully!"
            });
        } catch (error) {
            console.log('error', error);
            return res.status(400).json({
                message: 'Something went wrong!',
            });
        }
    });

// Login user route
userRouter.post('/login', body('email').isEmail().not().notEmpty({ ignore_whitespace: false }).withMessage('Invalid email!'),
    body('password').isString().not().notEmpty().withMessage('Password is required!'), async (req, res) => {
        try {
            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                return res.status(400).json({ status: 400, errors: validationErrors.array()[0].msg });
            }
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: 'All fields are required'
                });
            }
            const findUser = await Users.findOne({
                where: {
                    email
                }
            });

            if (!findUser) {
                return res.status(400).json({
                    message: "User not found!"
                });
            }

            const comparePass = await bcrypt.compare(password, findUser.password);
            if (!comparePass) {
                return res.status(400).json({
                    message: "Invalid password!"
                });
            }

            const jsonToken = await jwt.sign({
                id: findUser.id,
                email: findUser.email,
            }, process.env.JWT_SECRET)

            return res.status(200).json({
                message: "User logged in successfully!",
                token: jsonToken
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                message: 'Something went wrong!',
            });
        }
    });

module.exports = userRouter;