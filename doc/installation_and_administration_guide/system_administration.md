# System Administration

To manage the mysql database you can access the console running the following
command and introducing the mysql password:

```bash
mysql -u [mysql_host] -u [username] -p
```

If you have installed Keyrock using Docker, you can get into containers shell
with:

```bash
docker exec -it <container_name> /bin/bash
```

The relationships between the differents tables and their attributes of the
tables is the following:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/database_structure.png)

<p align="center">Figure 1: Tables relationship</p>
