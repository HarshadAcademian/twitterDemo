const pool = require('./models/db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err);
  } else {
    console.log('✅ Connected to DB at:', res.rows[0].now);
  }
});
