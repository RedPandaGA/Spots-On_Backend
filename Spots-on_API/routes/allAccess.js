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
            pass: hashedPassword
        };
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '24hr'
        });

        res.status(200).json({ success: `user_data was created successfully`, token: token, uid: newuid});
      } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
      }
});

allRouter.post('/login', async (req, res) => {
    const { pnum, pass } = req.body;
    try {
        //Sec prep
        const JWT_SECRET = process.env.JWT_SECRET;
        const client = await pool.connect();
        const result = await client.query(`SELECT pass, uid FROM user_data WHERE pnum='${pnum}'`);
        client.release();

        if (result.rows.length > 0) {
            const dbpass = result.rows[0].pass;
            if(bcrypt.compareSync(pass, dbpass)){
                console.log(dbpass);
                const payload = {
                    uid: result.rows[0].uid,
                    pass: dbpass
                };
                const token = jwt.sign(payload, JWT_SECRET, {
                    expiresIn: '24hr'
                });

                res.status(200).json({ success: `Login Successful`, token: token, uid: result.rows[0].uid});
            } else {
                console.log("fail");
                res.status(401).json({ error: 'Invalid phone number or password' });
            }
        } else {
            console.log("fail2");
            res.status(401).json({ error: 'User not found' });
        }
      } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
      }
});

module.exports = allRouter;