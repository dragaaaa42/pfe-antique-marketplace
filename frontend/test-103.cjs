const axios = require('axios');

(async () => {
  try {
    const loginRes = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
      email: 'testcollector4@example.com',
      password: 'testpass123'
    });
    const token = loginRes.data.access;
    
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    console.log("Adding artifact 103 to cart...");
    const cartRes = await axios.post('http://127.0.0.1:8000/api/cart/', {
      artifact: 103,
      quantity: 1
    }, config).catch(e => e.response);
    console.log("Response:", cartRes.status, cartRes.data);
  } catch (err) {
      console.log("ERROR:", err.message);
  }
})();
