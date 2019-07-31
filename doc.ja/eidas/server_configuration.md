# Server configuration

ユーザが自分の eID でログインできるように IdM を設定するには、設定ファイルで
eIDAS ノードへの接続を有効にする必要があります :

```javascript
config.eidas = {
    enabled: true,
    gateway_host: "localhost",
    node_host: "https://eidas.node.es/EidasNode",
    metadata_expiration: 60 * 60 * 24 * 365 // One year
};
```

-   enabled: _true_ に設定すると、eIDAS ノードへの接続が有効になります

-   gateway_host: IdM サービスの DNS を示します

-   node_host: eIDAS ノード・サーバが稼働しているエンドポイントを示します

-   metadata_expiration: サービス証明書の有効期限
