require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

const checkBookingOverlap = async (carId, startDate, endDate) => {
  const query = `
    SELECT * FROM bookings WHERE car_id = ? AND
    (start_date < ? AND end_date > ?)
  `;
  // Only consider bookings that are still active (pending or confirmed).
  const queryWithStatus = `
    SELECT * FROM bookings WHERE car_id = ? AND
    (start_date < ? AND end_date > ?) AND
    (status = 'confirmed' OR status = 'pending')
  `;
  const [rows] = await db.query(queryWithStatus, [carId, endDate, startDate]);
  return rows.length > 0 ? 'Car already booked' : 'Booking available';
};

module.exports = db;
module.exports.checkBookingOverlap = checkBookingOverlap;
