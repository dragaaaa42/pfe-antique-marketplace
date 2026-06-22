const axios = require('axios');

(async () => {
  try {
    console.log("Registering empty names...");
    const res = await axios.post('http://127.0.0.1:8000/api/auth/register/', {
      email: 'testempty@example.com',
      password: 'testpass123',
      first_name: '',
      last_name: '',
      role: 'buyer'
    });
    console.log("SUCCESS:", res.status);
  } catch (err) {
      if (err.response) {
          console.log("ERROR STATUS:", err.response.status);
          const html = err.response.data;
          console.log("DATA:", html);
      }
  }
})();
