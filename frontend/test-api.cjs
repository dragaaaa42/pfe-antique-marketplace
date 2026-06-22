const axios = require('axios');

(async () => {
  try {
    // 1. Login to get token
    console.log("Logging in...");
    const loginRes = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
      email: 'collector@example.com',
      password: 'collectorpass'
    });
    const token = loginRes.data.access;
    console.log("Logged in. Token:", token);

    // 2. Try to add artifact 103 to cart
    console.log("Adding to cart...");
    const cartRes = await axios.post('http://127.0.0.1:8000/api/cart/', {
      artifact: 103,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Cart Response:", cartRes.status, cartRes.data);
  } catch (err) {
    if (err.response) {
      console.log("Error Response:", err.response.status, err.response.data);
    } else {
      console.log("Network Error:", err.message);
    }
  }
})();
