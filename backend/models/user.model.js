const pool = require('../config/database');

// create a new user
const createUser = async (name, email, passwordHash, role, department) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, department)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, department, created_at`,
    [name, email, passwordHash, role, department]
  );
  return result.rows[0];
};

// find a user by email
const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};
const findUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, role, department FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};
module.exports = { createUser, findUserByEmail, findUserById };