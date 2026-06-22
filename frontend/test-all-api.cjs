const { chromium } = require('playwright');
const axios = require('axios');

(async () => {
  // We'll test the API directly using Axios.
  
  try {
    console.log("1. Registering user...");
    const email = 'testcollector10@example.com';
    await axios.post('http://127.0.0.1:8000/api/auth/register/', {
      email,
      password: 'testpass123',
      first_name: 'Test4',
      last_name: 'Collector4',
      role: 'buyer'
    });
    
    console.log("2. Logging in...");
    const loginRes = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
      email,
      password: 'testpass123'
    });
    const token = loginRes.data.access;
    
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // First, let's see what artifacts exist!
    console.log("3. Fetching artifacts...");
    const arts = await axios.get('http://127.0.0.1:8000/api/artifacts/');
    const artifacts = arts.data.results || arts.data;
    if (!artifacts || artifacts.length === 0) {
        console.log("NO ARTIFACTS IN DB!");
        return;
    }
    const artifactId = artifacts[0].id;
    console.log("Found artifact:", artifactId, artifacts[0].title);
    
    console.log("4. Adding to cart...");
    const cartRes = await axios.post('http://127.0.0.1:8000/api/cart/', {
      artifact: artifactId,
      quantity: 1
    }, config).catch(e => e.response);
    console.log("Cart Response:", cartRes.status, cartRes.data);
    
    console.log("5. Adding to wishlist...");
    const wishRes = await axios.post('http://127.0.0.1:8000/api/wishlist/', {
      artifact: artifactId
    }, config).catch(e => e.response);
    console.log("Wishlist Response:", wishRes.status, wishRes.data);
    
    console.log("6. Messaging seller...");
    const msgRes = await axios.post('http://127.0.0.1:8000/api/conversations/', {
      artifact: artifactId,
      body: 'Hello!'
    }, config).catch(e => e.response);
    console.log("Message Response:", msgRes.status, msgRes.data);

  } catch (err) {
      if (err.response) {
          console.log("ERROR:", err.response.status, err.response.data);
      } else {
          console.log("NETWORK ERROR:", err.message);
      }
  }
})();
