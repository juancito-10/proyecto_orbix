async function testLogin(correo, password) {
  try {
    const res = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password, captcha: 'test' })
    });
    const data = await res.json();
    console.log(correo, res.status, data);
  } catch (err) {
    console.log(correo, 'Error', err.message);
  }
}

async function run() {
  await testLogin('vanessa@orbix.com', 'admin123');
  await testLogin('juan@orbix.com', 'ventas123');
  await testLogin('andres@orbix.com', 'dev123');
}

run();
