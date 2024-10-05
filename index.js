const express =require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = parseInt(process.env.NODE_PORT);
const connection = require('./database/db.connection');
const userRoutes = require('./routes/user.route');
const taskRouter = require('./routes/tasks.route');
const bodyParser = require('body-parser');
const Users = require('./model/user.model');
const Tasks = require('./model/tasks.model');

(async () => {
    await connection.authenticate(async () => {
        console.log('Database connected');
    }).catch((error) => {
        console.log(error);
    });
    await Users.sync({ force: false });
    await Tasks.sync({ force: false });
})();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/users', userRoutes);
app.use('/tasks', taskRouter);


app.listen(port, () => {
    console.log(`App running on ${port}`);
})