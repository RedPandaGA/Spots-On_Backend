const express = require('express');
const authRouter = express.Router();
const { Pool } = require('pg');
const jwt = require("jsonwebtoken");

const pool = new Pool({
    user: 'apiuser',
    host: 'spotssql.infamousredpanda.com',
    database: 'spots_on',
    password: 'nag4pth1DAW@mhp1kgv',
    port: 5432, // Default PostgreSQL port
});

//Auth Check for all routes below
function authSessionCheck(req, res, next){
    try {
        const JWT_SECRET = process.env.JWT_SECRET;

        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({ error: "Unauthorized: Missing token" });
        }

        const token = authorization.replace("Bearer ", "");

        jwt.verify(token, JWT_SECRET, async (err, payload) => {
            if (err) {
                return res.status(401).json({ error: "Unauthorized: Invalid token" });
            }
            req.body.uid = payload.uid;
            next();
        });
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }

}

authRouter.use(authSessionCheck);

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
    const { cname, uid } = req.body;
    console.log("req.body: " + JSON.stringify(req.body));
    await createEntity(req, res, 'colony_data', 'cname, owner', `'${cname}', '${uid}'`);
});

authRouter.post('/joinColony', async (req, res) => {
    const { uid, invite } = req.body;
    try {
        console.log("invite: " + invite + " uid: " + uid);
        const client = await pool.connect();
        const colonyToJoin = await client.query(`SELECT cid FROM colony_data WHERE invite='${invite}'`);
        const result = await client.query(`INSERT INTO users_to_colony (uid, cid) VALUES ('${uid}','${colonyToJoin.rows[0].cid}') RETURNING *`);
        client.release();
        //console.log(result)
        res.status(200).json(result);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.get('/getNumMems/:sentcid', async (req, res) => {
    const { sentcid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT COUNT(*) AS row_count FROM users_to_colony WHERE cid = '${sentcid}';`);
        const dbres = result.rows[0].row_count;

        client.release();
        console.log(dbres);
        res.status(200).json({number: dbres});
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.get('/usersColonies/:sentuid', async (req, res) => {
    const { sentuid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT colony_data.cname AS name, colony_data.cid, colony_data.invite FROM colony_data INNER JOIN users_to_colony ON (colony_data.cid=users_to_colony.cid AND users_to_colony.uid='${sentuid}')`);
        const dbres = result.rows;

        client.release();
        console.log(dbres);
        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.get('/usersInColony/:sentcid', async (req, res) => {
    const { sentcid } = req.params;
    if(sentcid != "undefined"){
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT user_data.nickname, user_data.uid, user_data.status, user_data.status_code, user_data.incognito, user_data.usersettings, user_data.loc_history, user_data.last_contact, user_data.picture FROM user_data INNER JOIN users_to_colony ON (users_to_colony.cid='${sentcid}' AND users_to_colony.uid=user_data.uid)`);
            var dbres = result.rows;
            console.log(dbres)
            dbres = dbres.filter(user => !(user.uid == req.body.uid));
            dbres = dbres.filter(user => !user.incognito);
            console.log(dbres)
            //More code to handle a user's privacy settings (so remove things if this was requested by someone they have to never share location with).
    
            client.release();
    
            res.status(200).json(dbres);
        } catch (err) {
            console.error('Error executing query', err);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(500).send('No cid sent');
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
    console.log("req.body: " + JSON.stringify(req.body));
    console.log("location: " + location);
    await createEntity(req, res, 'spots_table', 'sname, location, danger, cid, radius', `'${sname}', '${JSON.stringify(location)}', '${danger}', '${cid}', '${radius}'`);
});

authRouter.get('/allSpotsByColony/:submittedcid', async (req, res) => {
    const { submittedcid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT st.sname AS name, st.location AS coordinate, st.danger AS safe, cd.cname AS "colonyName", st.radius, st.sid AS id FROM spots_table st JOIN colony_data cd ON st.cid = cd.cid WHERE st.cid = '${submittedcid}';`);
        const dbres = result.rows;

        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.post('/updateSpot', async (req, res) => {
    const { name, coordinate, safe, radius, id } = req.body;
    try {
        console.log(req.body);
        const client = await pool.connect();
        const result = await client.query(`UPDATE spots_table SET sname='${name}', location='${JSON.stringify(coordinate)}', danger='${safe}', radius='${radius}' WHERE sid='${id}'`);
        const dbres = result;

        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.get('/deleteSpot/:submittedsid', async (req, res) => {
    const { submittedsid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`DELETE FROM spots_table WHERE sid='${submittedsid}';`);
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
    const { ename, etime, creator, cid, location_sid, description, address } = req.body;
    await createEntity(req, res, 'event_table', 'ename, etime, creator, cid, location_sid, description, address', `'${ename}', '${etime}', '${creator}', '${cid}', '${location_sid}', '${description}', '${address}'`);
});

authRouter.get('/allEventsIn24/:sentuid', async (req, res) => {
    const { sentuid } = req.params;

    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT event_table.ename AS name, event_table.eid, event_table.etime AS dateTime, event_table.location_sid, event_table.description, event_table.address FROM event_table INNER JOIN users_to_colony ON (event_table.cid=users_to_colony.cid AND users_to_colony.uid='${sentuid}' AND event_table.etime <= NOW() + INTERVAL '24 hours')`);
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
        const result = await client.query(`SELECT event_table.ename AS name, event_table.eid, event_table.etime AS "dateTime", event_table.location_sid, event_table.description, event_table.address FROM event_table INNER JOIN users_to_colony ON (event_table.cid=users_to_colony.cid AND users_to_colony.uid='${sentuid}' AND event_table.etime > NOW() + INTERVAL '24 hours')`);
        const dbres = result.rows;

        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

//USER ROUTES

authRouter.post('/updateUserLocation', async (req, res) => {
    const { uid, location } = req.body;
    try {
        console.log(location);
        const client = await pool.connect();
        const result = await client.query(`UPDATE user_data SET loc_history = array_prepend('${JSON.stringify(location)}', loc_history) WHERE uid='${uid}'`);
        const dbres = result;

        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.post('/updateIncog', async (req, res) => {
    const { uid, incog } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query(`UPDATE user_data SET incognito = '${!incog}' WHERE uid='${uid}'`);
        const dbres = { success: incog, result: result};
        console.log(incog);
        
        client.release();

        res.status(200).json(dbres);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Internal Server Error');
    }
});

authRouter.post('/updateStatusCode', async (req, res) => {
    const { uid, status, statusCode } = req.body;
    try {
      console.log('Received request to update status code:', statusCode);
  
      // Uncomment the following lines to update the status in the database
      const client = await pool.connect();
      const result = await client.query(`UPDATE user_data SET status = '${status}', status_code = '${statusCode}' WHERE uid='${uid}'`);
      const dbres = result.rows; // Assuming you want to send the result back to the client
      client.release();
  
      // Log the success message
      console.log('User status updated successfully:');
  
      // Send a response back to the client
      res.status(200).json({aaaa: "aaaaa"});
    } catch (err) {
      // Log the error
      console.error('Error executing query', err);
  
      // Send an error response back to the client
      res.status(500).send('Internal Server Error');
    }
  });

authRouter.get('/getUserInfo/:sentuid', async (req, res) => {
    const { sentuid } = req.params;
    if(sentuid != "undefined"){
        try {
            const client = await pool.connect();
            const result = await client.query(`SELECT pass, uid, nickname, status, status_code, incognito, usersettings, emergency, premium, loc_history FROM user_data WHERE uid='${sentuid}'`);

    
            client.release();
            //currentLocation: result.rows[0].loc_history[0]
            res.status(200).json({user: { nickname: result.rows[0].nickname,  
                                                uid: result.rows[0].uid,
                                                status: result.rows[0].status,
                                                statusCode: result.rows[0].status_code,
                                                incognito: result.rows[0].incognito,
                                                userSettings: result.rows[0].incognito,
                                                emergency: result.rows[0].emergency,
                                                premium: result.rows[0].premium,
                                        }
        });
        } catch (err) {
            console.error('Error executing query', err);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(500).send('No cid sent');
    } 
});

module.exports = authRouter;