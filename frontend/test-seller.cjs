const axios = require('axios');

(async () => {
  try {
    console.log("Registering seller...");
    const res = await axios.post('http://127.0.0.1:8000/api/auth/register/', {
      email: 'testseller99@example.com',
      password: 'testpass123',
      first_name: 'Test',
      last_name: 'Seller',
      role: 'seller'
    });
    console.log("SUCCESS:", res.status);
  } catch (err) {
      if (err.response) {
          console.log("ERROR STATUS:", err.response.status);
          const html = err.response.data;
          // Look for Django Exception string
          const match = html.match(/Exception Value:<\/th>\s*<td><pre>(.*?)<\/pre><\/td>/s);
          if (match) {
              console.log("EXCEPTION:", match[1].trim());
          } else {
              console.log("HTML START:", html.substring(0, 500));
          }
      } else {
          console.log("NETWORK ERROR:", err.message);
      }
  }
})();
