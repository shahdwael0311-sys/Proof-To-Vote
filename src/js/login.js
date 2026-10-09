const API = 'http://127.0.0.1:8000';
const form = document.getElementById('loginForm');
const message = document.getElementById('formMessage');

form.addEventListener('submit', async event => {
  event.preventDefault();
  message.className = 'message';
  message.textContent = 'Checking credentials…';
  try {
    const response = await fetch(`${API}/login`, {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({voter_id: document.getElementById('voter-id').value.trim(), password: document.getElementById('password').value})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Login failed');
    localStorage.setItem('ptvToken', data.token);
    localStorage.setItem('ptvRole', data.role);
    const page = data.role === 'admin' ? 'admin.html' : 'index.html';
    location.replace(`/${page}?Authorization=${encodeURIComponent(`Bearer ${data.token}`)}`);
  } catch (error) { message.textContent = error.message; }
});
