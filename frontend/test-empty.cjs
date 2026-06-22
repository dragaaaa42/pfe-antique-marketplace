const axios = require('axios');

(async () => {
  try {
    console.log("Registering empty...");
    const res = await axios.post('http://127.0.0.1:8000/api/auth/register/', {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'buyer'
    });
    console.log("SUCCESS:", res.status);
  } catch (err) {
      if (err.response) {
          console.log("ERROR STATUS:", err.response.status);
          const html = err.response.data;
          console.log("DATA TYPE:", typeof html);
          if (typeof html === 'string') {
              console.log("STRING PREVIEW:", html.substring(0, 100));
          } else {
              console.log("JSON:", JSON.stringify(html));
          }
      }
  }
})();
