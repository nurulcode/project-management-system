const { Pool } = require('pg')

  // const pool = new Pool({
  //   user: 'postgres',
  //   host: 'localhost',
  //   database: 'pms',
  //   password: 'rahasia',
  //   port: 5432,
  // })

const pool = new Pool({
  user: 'hwtcqnzncchrwq',
  host: 'ec2-54-83-44-4.compute-1.amazonaws.com',
  database: 'deqlhoeuf03hni',
  password: 'e2756c66d082e2e7f057726e874643639352292541c00c304169aa6348b91af4',
  port: 5432,
})

module.exports = pool;
