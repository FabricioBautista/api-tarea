const express = require('express');
const bodyParser = require('body-parser');
const { db, initDB } = require('./db');

const app = express();
const PORT = 8081; // Cambiado a 8081

// Middleware para parsear JSON
app.use(express.json()); // Usando express.json() en lugar de bodyParser

// Inicializa la base de datos
initDB();

// Rutas para manejar solicitudes HTTP
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ user: row });
  });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ updated: this.changes });
  });
});

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

app.patch('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  let updates = [];
  let params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }

  if (email) {
    updates.push('email = ?');
    params.push(email);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
  }

  params.push(id); 

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ updated: this.changes });
  });
});

// Escucha en el puerto especificado
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API REST corriendo en http://0.0.0.0:${PORT}`);
});
