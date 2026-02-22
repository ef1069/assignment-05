
// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];// Middleware to parse JSON bodies

const express = require('express');
const app = express();
const port = 3000;
const { body, validationResult } = require('express-validator');

const requestLogger = (req, res, next) => {
  const timesptampe = new Date().toISOString();
  console.log(`[${timesptampe}] ${req.method} ${req.originalUrl}`);

  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:',
      JSON.stringify(req.body, null, 2));
    }
    next();
  };

  const todoValidation = [
  body('name')
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),

  body('description')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),

  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number'),

  body('category')
    .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
    .withMessage('Category must be one of: appetizer, entree, dessert, beverage'),

  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients must be an array with at least one item'),

  body('available')
    .isBoolean()
    .withMessage('Available must be a boolean value')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages=
    errors.array().map(error=> error.msg);

    return res.status(400).json({ 
      errors: 'Validation failed',
      messages: errorMessages
    });
  }

  if (req.body.completed === undefined){
    req.body.completed = false;
  }
  next();
};

  app.use(express.json()); 
  app.use(express.json());
  app.use(requestLogger);


if (require.main === module) {
    app.listen(port, () => {
        console.log(`Restaurant API server is running at http://localhost:${port}`);
    });
}

module.exports = app;

app.get('/', (req,res)=>{ // Root endpoint to provide API information
    res.json({
        message: "Welcome to the Restaurant API",
        endpoints: {
            "GET /api/menu": "Get all menu items",
            "GET /api/menu/:id": "Get a specific menu item"
        }
    });
});

app.get('/api/menu', (req, res) => {
    res.json(menuItems);
});

app.get('/api/menu/:id', (req, res) => {
    const menuId = parseInt(req.params.id);
    const menuItem = menuItems.find(m => m.id === menuId);
    if (menuItem) {
        res.json(menuItem);
    } else {
        res.status(404).json({ error: 'Menu item not found' });
    }
});

app.post('/api/menu', todoValidation, handleValidationErrors, (req, res) => {
    const {name, description, price, category, ingredients, available} = req.body;

    const newMenuItem = {
        id: menuItems.length + 1,
        name,
        description,
        price,
        category,
        ingredients,
        available
    };
    menuItems.push(newMenuItem);

    res.status(201).json(newMenuItem);
});

app.put('/api/menu/:id', todoValidation, handleValidationErrors, (req,res) => {
    const menuId = parseInt(req.params.id);
    const {name, description, price, category, ingredients, available} = req.body;

    const menuItemIndex = menuItems.findIndex(m => m.id === menuId);

    if (menuItemIndex === -1) {
        return res.status(404).json({error: 'Menu item not found'});
    }

    menuItems[menuItemIndex] = {
        id: menuId,
        name,
        description,
        price,
        category,
        ingredients,
        available
    };
    res.json(menuItems[menuItemIndex]);
});

app.delete('/api/menu/:id', (req, res) => {
    const menuID = parseInt(req.params.id);

    const menuItemIndex = menuItems.findIndex(m => m.id === menuID);

    if (menuItemIndex === -1) {
        return res.status(404).json({error: 'Menu item not found'});
    }

    const deletedMenuItem = menuItems.splice(menuItemIndex, 1);

    res.json({message: 'Menu item deleted successfully', menuItem: deletedMenuItem[0]});
});



