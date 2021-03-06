const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

let idResults = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);

  let result = await db.query(`
    INSERT INTO jobs(title, salary, equity, company_handle)
    VALUES ('jobtitle', 100000, 0.001, 'c1'),
           ('jobtitle2', 200000, 0.002, 'c2'),
           ('jobtitle3', 300000, 0.003, 'c3')
    RETURNING id`);

  idResults.push(result.rows[0]);
  idResults.push(result.rows[1]);
  idResults.push(result.rows[2]);
  
  // // console.log("idresults", idResults);
  // [jobId1, jobId2, jobId3] = idResults;

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email,
                          is_admin)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com',false),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com', false),
               ('admin1', $3, 'AD1F', 'AD2L', 'AD2@email.com', true)
        RETURNING username`, 
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password3", BCRYPT_WORK_FACTOR),
    ]);

}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}




module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  idResults,
};