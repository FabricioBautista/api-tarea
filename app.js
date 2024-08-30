const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 8001; // Puerto en el que correrá la API

// Middleware para manejar JSON
app.use(express.json());

// Crear la base de datos y la tabla
const db = new sqlite3.Database('users.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
    return;
  }
  console.log('Conectado a la base de datos SQLite.');

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error('Error al crear la tabla:', err.message);
    } else {
      console.log('Tabla users creada o ya existía.');
    }
  });
});

// Rutas de la API
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API REST corriendo en http://0.0.0.0:${PORT}`);
});
