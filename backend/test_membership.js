const axios = require('axios');
async function test() {
  try {
    const login = await axios.post('https://api.aimstore.in/api/v1/auth/login', {
      email: 'md@zylare.com',
      password: 'password123'
    });
    const token = login.data.accessToken;
    const res = await axios.get('https://api.aimstore.in/api/v1/auth/membership', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
test();
