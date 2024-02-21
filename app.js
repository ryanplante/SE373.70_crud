const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
require('./database'); // Connect to MongoDB
const Employee = require('./models/employee');

hbs.registerHelper('eq', (arg1, arg2) => {
    return arg1 === arg2 ? 'selected' : '';
  });

hbs.registerPartials(__dirname + '/views/partials');


const app = express();
const port = 3000;

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));


// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/employees', async (req, res) => {
    try {
        const employee = new Employee(req.body);
        await employee.save();
        res.redirect('/employees');
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/employees', async (req, res) => {
    try {
        const employees = await Employee.find({});
        res.render('employees', { employees });
    } catch (error) {
        res.status(500).send();
    }
});

app.get('/employees/edit/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (employee.startDate) {
            // Ensure startDate is a Date object
            const dateObj = new Date(employee.startDate);
            // Format the date as YYYY-MM-DD
            const formattedDate = dateObj.toISOString().split('T')[0];
            console.log(formattedDate)
            employee.startDate = formattedDate;
        }
        res.render('edit', { employee });
    } catch (error) {
        res.status(404).send();
    }
});



app.post('/employees/edit/:id', async (req, res) => {
    try {
        await Employee.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/employees');
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/employees/delete/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.send('<h2>Employee deleted successfully</h2>');
    } catch (error) {
        res.status(500).send();
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
