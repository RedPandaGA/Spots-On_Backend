const express = require('express');
const authRouter = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
    user: 'apiuser',
    host: 'spotssql.infamousredpanda.com',
    database: 'spots_on',
    password: 'nag4pth1DAW@mhp1kgv',
    port: 5432, // Default PostgreSQL port
});

//PUT AUTH FUNC HERE

/*authRouter.post('/action', async (req, res) => {

});*/

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

//COLONY ROUTES

authRouter.post('/createColony', async (req, res) => {
    const { cname, owner } = req.body;
    await createEntity(req, res, 'colony_data', 'cname, owner', `'${cname}', '${owner}'`);
});

authRouter.get('/usersColonies/:sentuid', async (req, res) => {
    const { sentuid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT colony_data.cname, colony_data.cid FROM colony_data INNER JOIN users_to_colony ON (colony_data.cid=users_to_colony.cid AND users_to_colony.uid='${sentuid}')`);
        const dbres = result.rows;

        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.get('/usersInColony/:sentcid', async (req, res) => {
    const { sentcid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT user_data.nickname, user_data.uid, user_data.status, user_data.status_code, user_data.incognito, user_data.usersettings, user_data.loc_history, user_data.last_contact, user_data.picture FROM user_data INNER JOIN users_to_colony ON (users_to_colony.cid='${sentcid}' AND users_to_colony.uid=user_data.uid)`);
        const dbres = result.rows;

        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

//GROUP ROUTES

authRouter.post('/createGroup', async (req, res) => {
    const { gname, owner } = req.body;
    await createEntity(req, res, 'group_chats', 'gname, owner', `'${gname}', '${owner}'`);
});

authRouter.get('/usersGroups/:sentuid', async (req, res) => {
    const { sentuid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT group_chats.gname, group_chats.gid, group_chats.picture FROM group_chats INNER JOIN users_to_group ON (group_chats.gid=users_to_group.gid AND users_to_group.uid='${sentuid}')`);
        const dbres = result.rows;

        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

//SPOTS ROUTES

authRouter.post('/createSpot', async (req, res) => {
    const { sname, location, danger, cid, radius } = req.body;
    await createEntity(req, res, 'spots_table', 'sname, location, danger, cid, radius', `'${sname}', '${JSON.stringify(location)}', '${danger}', '${cid}', '${radius}'`);
});

authRouter.get('/allSpotsByColony/:submittedcid', async (req, res) => {
    const { submittedcid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT sname, location, danger, cid, radius FROM spots_table WHERE cid='${submittedcid}'`);
        const dbres = result.rows;

        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

//EVENTS ROUTES

authRouter.post('/createEvent', async (req, res) => {
    const { ename, etime, creator, cid, location_sid, description } = req.body;
    await createEntity(req, res, 'event_table', 'ename, etime, creator, cid, location_sid, description', `'${ename}', '${etime}', '${creator}', '${cid}', '${location_sid}', '${description}'`);
});

authRouter.get('/allEventsIn24/:sentuid', async (req, res) => {
    const { sentuid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT event_table.ename, event_table.eid, event_table.etime, event_table.location_sid FROM event_table INNER JOIN users_to_colony ON (event_table.cid=users_to_colony.cid AND users_to_colony.uid='${sentuid}' AND event_table.etime <= NOW() + INTERVAL '24 hours')`);
        const dbres = result.rows;

        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.get('/allEventsOut24/:sentuid', async (req, res) => {
    const { sentuid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT event_table.ename, event_table.eid, event_table.etime, event_table.location_sid FROM event_table INNER JOIN users_to_colony ON (event_table.cid=users_to_colony.cid AND users_to_colony.uid='${sentuid}' AND event_table.etime > NOW() + INTERVAL '24 hours')`);
        const dbres = result.rows;

        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

//USER ROUTES

// authRouter.post('/createUser', async (req, res) => {
//     const { email, pass, pnum, nickname } = req.body;
//     await createEntity(req, res, 'user_data', 'email, pass, pnum, nickname', `'${email}', '${pass}', '${pnum}', '${nickname}'`);
// });

module.exports = authRouter;