# システム管理

mysql データベースを管理するには、次のコマンドを実行して mysql
パスワードを入力してコンソールにアクセスします :

```bash
mysql -u [mysql_host] -u [username] -p
```

Docker を使って Keyrock をインストールした場合は、次のようにして
コンテナ・シェルに入ります :

```bash
docker exec -it <container_name> /bin/bash
```

さまざまなテーブルとそのテーブルの属性との関係は次のとおりです :

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/database_structure.png)

<p align="center">図1: テーブルの関係</p>
