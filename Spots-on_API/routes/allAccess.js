const express = require('express');
const allRouter = express.Router();
const jwt = require("jsonwebtoken");
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    user: 'apiuser',
    host: 'spotssql.infamousredpanda.com',
    database: 'spots_on',
    password: 'nag4pth1DAW@mhp1kgv',
    port: 5432, // Default PostgreSQL port
});

//GENERAL FUNCS

//USER ROUTES

allRouter.post('/createUser', async (req, res) => {
    const { email, pass, pnum, nickname } = req.body;
    try {
        //Sec prep
        const hashedPassword = bcrypt.hashSync(pass, 12);
        const JWT_SECRET = process.env.JWT_SECRET;

        const client = await pool.connect();
        const result = await client.query(`INSERT INTO user_data (email, pass, pnum, nickname) VALUES ('${email}', '${hashedPassword}', '${pnum}', '${nickname}') RETURNING uid`);
        const newuid = result.rows[0].uid;
        client.release();

        console.log(newuid);
        const payload = {
            uid: newuid,
            password: hashedPassword
        };
        const token = jwt.sign(payload, JWT_SECRET);

        res.status(200).json({ success: `user_data was created successfully`, token: token, uid: newuid});
      } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
      }
});

module.exports = allRouter;