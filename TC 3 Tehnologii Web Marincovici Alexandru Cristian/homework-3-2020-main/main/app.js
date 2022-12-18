const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')

// TODO - Sequelize instance
const db = new Sequelize(

    "DefaultDatabase",
    "root",
    "",
    {

        host: "localhost",
        dialect: "mariadb",

    }
);

db.authenticate().
    then(() => console.log("Connected")).
    catch(err => console.log(err));

let FoodItem = db.define('foodItem', {
    name: Sequelize.STRING,
    category: {
        type: Sequelize.STRING,
        validate: {
            len: [3, 10]
        },
        allowNull: false
    },
    calories: Sequelize.INTEGER
}, {
    timestamps: false
})


const app = express();
// TODO
app.use(express.json());

app.get('/create', async (req, res) => {
    try {
        await db.sync({ force: true })
        for (let i = 0; i < 10; i++) {
            let foodItem = new FoodItem({
                name: 'name ' + i,
                category: ['MEAT', 'DAIRY', 'VEGETABLE'][Math.floor(Math.random() * 3)],
                calories: 30 + i
            })
            await foodItem.save()
        }
        res.status(201).json({ message: 'created' })
    }
    catch (err) {
        console.warn(err.stack)
        res.status(500).json({ message: 'server error' })
    }
})

app.get('/food-items', async (req, res) => {
    try {
        let foodItems = await FoodItem.findAll()
        res.status(200).json(foodItems)
    }
    catch (err) {
        console.warn(err.stack)
        res.status(500).json({ message: 'server error' })
    }
})

app.post('/food-items', async (req, res) => {

    try {

        if (req.body.calories < 0) {

            res.status(400).json({ message: "calories should be a positive number" });

        }
        else if (req.body.category.length < 3 || req.body.category.length > 10) {

            res.status(400).json({ message: "not a valid category" });

        } else {

            await FoodItem.create(req.body);
            res.status(201).json({ message: "created" });

        }
    }
    catch (err) {
        if (Object.keys(req.body).length == 0) {

            res.status(400).json({ message: "body is missing" });

        } else if (!req.body.name || !req.body.category || !req.body.calories) {

            res.status(400).json({ message: "malformed request" });

        }
    }
})

module.exports = app
