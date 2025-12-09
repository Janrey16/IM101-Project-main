const express = require('express');
const router = express.Router();
const { getAllCars, getCarById, addCar, updateCar, deleteCar } = require('../controllers/carController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllCars);
router.get('/:id', getCarById);
router.post('/', verifyAdmin, addCar);
router.put('/:id', verifyAdmin, updateCar);
router.delete('/:id', verifyAdmin, deleteCar);

module.exports = router;
