const exec = require('child_process').exec;

exec('npm run-script create_db', function(error) {
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Unable to create database: ', error);
    process.exit();
  }

  // eslint-disable-next-line no-console
  console.info('Database created');

  exec('npm run-script migrate_db', function(error) {
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Unable to migrate database: ', error);
      process.exit();
    }

    // eslint-disable-next-line no-console
    console.info('Database migrated');

    exec('npm run-script seed_db', function(error) {
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Unable to seed database: ', error);
      }
      if (
        process.env.IDM_ADMIN_PASS === undefined ||
        process.env.IDM_ADMIN_USER === undefined ||
        process.env.IDM_ADMIN_EMAIL === undefined ||
        process.env.IDM_ADMIN_ID === undefined
      ) {
        // eslint-disable-next-line no-console
        console.warn(`****************
                            WARNING: Seeding database with an admin user using default credentials. 
                            This user must be deleted when running on a production instance");
                        ****************`);
      }
      // eslint-disable-next-line no-console
      console.info('Database seeded');

      process.exit();
    });
  });
});
