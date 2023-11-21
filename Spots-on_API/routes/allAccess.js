const express = require('express');
const allRouter = express.Router();

const { Pool } = require('pg');

const pool = new Pool({
    user: 'apiuser',
    host: 'spotssql.infamousredpanda.com',
    database: 'spots_on',
    password: 'nag4pth1DAW@mhp1kgv',
    port: 5432, // Default PostgreSQL port
});

//GENERAL FUNCS
const createEntity = async (req, res, tableName, columns, values) => {
    try {
      const client = await pool.connect();
      const result = await client.query(`INSERT INTO ${tableName} (${columns}) VALUES (${values}) RETURNING *`);
      const dbres = result.rows;
  
      client.release();
  
      res.status(200).json({ success: `${tableName} was created successfully`, dbres: dbres });
    } catch (err) {
      console.error('Error executing query', err);
      res.status(500).send('Internal Server Error');
    }
};

//USER ROUTES

allRouter.post('/createUser', async (req, res) => {
    const { email, pass, pnum, nickname } = req.body;
    await createEntity(req, res, 'user_data', 'email, pass, pnum, nickname', `'${email}', '${pass}', '${pnum}', '${nickname}'`);
});

module.exports = allRouter;