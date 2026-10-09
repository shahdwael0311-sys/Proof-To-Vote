const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const html = name => path.join(__dirname, 'src/html', name);
const sendAsset = folder => (req, res) => res.sendFile(path.join(__dirname, 'src', folder, req.params.file));

function authorize(role) {
  return (req, res, next) => {
    const raw = req.query.Authorization || req.get('Authorization') || '';
    const token = raw.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).send('<h1>Login required</h1><p><a href="/login">Return to login</a></p>');
    try {
      const user = jwt.verify(token, process.env.SECRET_KEY, { algorithms: ['HS256'] });
      if (role && user.role !== role) return res.status(403).send('<h1>Access denied</h1>');
      req.user = user;
      next();
    } catch (_) {
      res.status(401).send('<h1>Invalid or expired authorization</h1>');
    }
  };
}

app.get('/', (_, res) => res.sendFile(html('home.html')));
app.get('/login', (_, res) => res.sendFile(html('login.html')));
app.get('/register', (_, res) => res.sendFile(html('register.html')));
app.get('/dashboard', (_, res) => res.sendFile(html('dashboard.html')));
app.get('/admin.html', authorize('admin'), (_, res) => res.sendFile(html('admin.html')));
app.get('/index.html', authorize('user'), (_, res) => res.sendFile(html('index.html')));
app.get('/css/:file', sendAsset('css'));
app.get('/js/:file', sendAsset('js'));
app.get('/dist/:file', sendAsset('dist'));
app.get('/assets/:file', sendAsset('assets'));
app.get('/favicon.ico', (_, res) => res.sendFile(path.join(__dirname, 'public/favicon.ico')));

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`Proof-To-Vote running at http://127.0.0.1:${port}`));
