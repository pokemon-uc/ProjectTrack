const pool = require("../config/database");

const createUser = async (name, email, passwordHash, department) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, department)
     VALUES ($1, $2, $3, 'student', $4)
     RETURNING id, name, email, role, department, created_at`,
    [name, email, passwordHash, department],
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, department
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [email],
  );
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, role, department
     FROM users
     WHERE id = $1`,
    [id],
  );
  return result.rows[0];
};

module.exports = { createUser, findUserByEmail, findUserById };
