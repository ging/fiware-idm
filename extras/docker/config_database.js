var database = require('../../config').database;
var exec = require('child_process').exec;

// Load ORM Model
var Sequelize = require('sequelize');

// Use BBDD Mysql
var sequelize = new Sequelize(database.database, database.username, database.password,
{
    host: database.host,
    dialect: database.dialect,
    port: (database.port !== 'default') ? database.port : undefined
}
);

function setSequence() {
  console.log('>>>>>>>> setSequence call');
  return sequelize.query("SELECT setval('public.role_permission_id_seq', 10, true);", {type: Sequelize.QueryTypes.SELECT})
}

function setSeqPromise() {
  return new Promise((resolve, reject) => {
    setSequence().then(function(res) {
      console.log('setSeqPromise>>>>>>>>>>>>>>>>>> public.role_permission_id_seq set res: ', res);
      resolve(res)
    }).catch(function(error) {
      console.log('setSeqPromise error detected: ', error);
      reject(error)
    })
  })
}

sequelize
.authenticate()
.then(() => {
    console.log('Database is already created')
    process.exit()
})
.catch(err => {

    if (err.original.code === 'ER_BAD_DB_ERROR' || err.original.code === '3D000') {
        exec('npm run-script create_db', function(error, stdout, stderr){
            if (error) {
                console.log("Unable to create database: ", err);
                process.exit()
            }

            console.log("Database created")

            exec('npm run-script migrate_db', function(error, stdout, stderr){
                if (error) {
                    console.log("Unable to migrate database: ", err);
                    process.exit()
                }

                console.log("Database migrated")

                exec('npm run-script seed_db', function(error, stdout, stderr){
                    if (error) {
                        console.log("Unable to seed database: ", err);

                    }
                    if (process.env.IDM_ADMIN_PASS === undefined || process.env.IDM_ADMIN_USER === undefined ||
                       process.env.IDM_ADMIN_EMAIL === undefined || process.env.IDM_ADMIN_PASS === undefined) {
                        console.log( "****************");
                        console.log( "WARNING: Seeding database with an admin user using default credentials." +
                        "This user must be deleted when running on a production instance");
                        console.log( "****************");
                    }
                    // set sequence or any other needed adaptation of the model or data seed
                    if (database.dialect === 'postgres') {
                        console.log('>>>>>>>>>>>>>>>>>> enter set sequence connect database >>>>>>>>>>>>>>>>>>>');
                        sequelize
                        .authenticate()
                        .then(() => {
                            console.log('Database is connected')
                            setSeqPromise().then(res => {
                               console.log('query OK ! res: ', res)
                               process.exit()
                            })
                            .catch(error => {
                              console.log('setSeqPromise error occured :', error)
                              process.exit()
                            })
                        })
                        .catch(err => {
                          console.log('cannot connect to database error:', err)
                          process.exit()
                        })

                    } else {
                      console.log("Database seeded")
                      process.exit()
                    }
                });
            });
        });
    } else {
        console.log("Unable to connect to the database: ", err);
        process.exit()
    }
})
