このセクションでは、管理者がKeyrockに登録されているアプリケーションを管理して
データ使用制御ポリシーを作成する方法について説明します。

使用制御ポリシーを管理するには、アプリケーション・ビューの "access & usage" に
移動します。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UsageControl_button.png)

<p align="center">図 1: アプリケーション・データ使用ポリシー</p>

右のパネルにあるプラスボタンをクリックして、使用制御ポリシーを作成できます :

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UsageControl_how_to_create.png)

<p align="center">図 2: ポリシーの一覧</p>

使用制御ポリシーを作成するには、以下を挿入する必要があります :

-   Name (名前)

-   Description (説明)

-   Type (タイプ). Keyrock では、以下の使用制御ポリシー・タイプを定義します :

    -   Aggregation (アグリゲーション)

    -   Count (カウント)

    -   Custom (カスタム). 独自の ODRL ポリシー・ルールを挿入できます

-   Punishment (ジョブの中止, 退会 または 収益化)

-   使用制御ポリシー・ルールが適用されるタイム・ラプス

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UsageControl_create_policy.png)

<p align="center">図 3: ポリシーの作成</p>

最後に、いくつかの使用制御ポリシーをロールに割り当てることができます :

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UsageControl_assign_rule.png)

<p align="center">図 4: ポリシーの割り当て</p>

