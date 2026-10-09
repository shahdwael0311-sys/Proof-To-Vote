const API = 'http://127.0.0.1:8000';
const form = document.getElementById('registerForm');
const message = document.getElementById('formMessage');
form.addEventListener('submit', async event => {
  event.preventDefault(); message.className = 'message'; message.textContent = 'Submitting…';
  const payload = {voter_id: voter('voter-id'), student_id: voter('student-id'), email: voter('email'), wallet_address: voter('wallet'), password: document.getElementById('password').value};
  try {
    const response = await fetch(`${API}/register`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
    const data = await response.json(); if (!response.ok) throw new Error(data.detail || 'Registration failed');
    message.className = 'message success'; message.textContent = data.message; form.reset();
  } catch (error) { message.textContent = error.message; }
});
function voter(id) { return document.getElementById(id).value.trim(); }
