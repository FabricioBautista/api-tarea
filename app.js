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

// Ruta para obtener todos los usuarios
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ users: rows });
  });
});

// Ruta para obtener un usuario por ID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      res.json({ user: row });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

// Ruta para crear un nuevo usuario
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo electrónico son obligatorios' });
  }

  db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, name, email });
  });
});

// Ruta para actualizar un usuario por ID
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo electrónico son obligatorios' });
  }

  db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes > 0) {
      res.json({ id, name, email });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

// Ruta para eliminar un usuario por ID
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes > 0) {
      res.json({ message: 'Usuario eliminado' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API REST corriendo en http://0.0.0.0:${PORT}`);
});
