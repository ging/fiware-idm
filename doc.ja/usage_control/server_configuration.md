# サーバ設定

データ使用ポリシーの作成を許可するように IdM を設定するには、設定ファイルで PTP
への接続を有効にする必要があります :

```javascript
config.usage_control = {
    enabled: true,
    ptp: {
        host: 'localhost',
        port: 8090
    }
};
```

-   enabled: _true_ に設定すると、PTP への接続が有効になります

-   ptp.host: PTP サービスの DNS を示します

-   ptp.port: PTP がリッスンしているポートを示します
