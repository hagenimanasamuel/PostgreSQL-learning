const express = require('express');
const app = express();
const PORT = 6000;
const { Client } = require('pg');

app.use(express.json());

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    database: 'mydb',
    password: 'Umugisha123!'
});

client.connect((err) => {
    if (err) {
        console.error("An error occured", err)
    } else {
        console.log("Connection succeed!");
    }
})

app.get('/', (req, res) => {
    console.log("This app is running well");
    res.send("This app is running well!")
});

app.get('/users', (req, res) => {
    client.query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.error("An error occured", err);
            res.status(500).send("An error occured while fetching users");
        } else {
            res.json(result.rows);
        }
    })
});

app.get('/users/:user_id', (req, res) => {
    const { user_id } = req.params;
    client.query('SELECT * FROM users WHERE user_id = $1', [user_id], (err, result) => {
        if (err) {
            console.error("An error occured", err);
            res.status(500).send("An error occured while fetching user");
        } else if (result.rows.length === 0) {
            res.status(404).send("User not found");
        } else {
            res.json(result.rows[0]);
        }
    })
});

app.post('/users', (req, res) => {
    const { username, email } = req.body;
    client.query('INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *', [username, email], (err, result) => {
        if (err) {
            console.log("An error occured", err);
            res.status(500).send("An error occured while adding user");
        } else {
            res.status(201).json(result.rows[0]);
        }
    })
});


app.put('/users/:user_id', (req, res) => {
    const { user_id } = req.params;
    const { username, email } = req.body;
    client.query(
        'UPDATE users SET username = $1, email = $2 WHERE user_id = $3 RETURNING *',
        [username, email, user_id],
        (err, result) => {
            if (err) {
                console.error("An error occured", err);
                res.status(500).send("An error occured while updating user");
            } else if (result.rows.length === 0) {
                res.status(404).send("User not found");
            } else {
                res.json(result.rows[0]);
            }
        }
    )
});

app.delete('/users/:user_id', (req, res) => {
    const { user_id } = req.params;
    client.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [user_id], (err, result) => {
        if (err) {
            console.error("An error occured", err);
            res.status(500).send("An error occured while deleting user");
        } else if (result.rows.length === 0) {
            res.status(404).send("User not found");
        } else {
            res.send("User deleted successfully");
        }
    })
});

app.listen(PORT, () => {
    console.log(`Listening ${PORT}`);
})