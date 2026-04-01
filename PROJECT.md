# Dodo Todo App

フルスタックのTodo管理アプリケーション。ユーザー役割（通常ユーザーとスーパーユーザー）をサポートし、期限管理、リマインダー通知などの高機能を提供します。

---

## 機能一覧

### 認証・ユーザー管理
- [x] Firebase Auth（本番環境）
- [x] Google Sign-In
- [x] Email/Password 認証（メールOTP確認機能付き）
- [x] メールOTP認証（6桁確認コード）
- [x] ユーザー役割：Normal（通常ユーザー）とSuper（管理者）
- [x] 初回来店時の役割選択機能
- [x] セッションベースの認証維持
- [x] ユーザー名管理（新規登録時に入力、MongoDBに保存）

### Todo管理
- [x] Todo作成（タイトル、説明）
- [x] Todo編集（タイトル、説明、ステータス）
- [x] ステータス管理：`pending` / `completed` / `delayed` / `abandoned` / `overdue`
- [x] 完了日付記録（Normalユーザーのみ）
- [x] Deadline機能（自動設定：当日23:59:59）
- [x] Overdue自動判定（Fetch時に自動ステータス変更）
- [x] Delay機能（1〜4日間延期）
- [x] 論理削除（Superユーザーのみ）

### フィルター・検索
- [x] ステータスフィルター（Dashboard & Admin）
- [x] 完了月フィルター
- [x] Delay日数フィルター
- [x] 削除済みTodo表示（Adminのみ）

### リマインダー通知
- [x] 期限5分前通知
- [x] Browser Notification API対応
- [x] インアプリモーダル通知（フォールバック）
- [x] 重複通知防止（reminderSentフラグ）

### メール通知
- [x] Todo作成時Superユーザーへメール通知（Resend使用）
- [x] 本物メールアドレス持有者のみ送信
- [x] メール内容：作成者名、タイトル、説明文

### 管理機能（Superユーザーのみ）
- [x] 全ユーザーのTodo閲覧
- [x] Todo削除（論理削除）
- [x] Todo復元
- [x] ユーザー一覧表示
- [x] ステータス別カウント表示
- [x] ユーザー名表示（メールアドレス付き）

### UI/UX
- [x] レスポンシブデザイン
- [x] 紫色（Purple）のOverdue表示
- [x] ステータス別カラー表示
- [x] 日本語対応（Locale: ja-JP）
- [x] ユーザー名表示（ヘッダー）

---

## 技術スタック

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **HTTP Client**: Fetch API
- **Styling**: CSS（Vanilla）
- **Notifications**: Browser Notification API

### Backend
- **Runtime**: Node.js 18
- **Platform**: Firebase Cloud Functions
- **Framework**: Express.js（Cloud Functions内で使用）
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: Firebase Auth

### Infrastructure
- **Hosting**: Firebase Hosting
- **Backend**: Firebase Cloud Functions
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Authentication

---

## プロジェクト構造

```
todo/
├── client/                         # React + Vite フロントエンド
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Firebase Auth コンテキスト
│   │   ├── pages/
│   │   │   ├── Login.jsx         # ログイン画面（Google/Email）
│   │   │   ├── SelectRole.jsx    # 役割選択画面
│   │   │   ├── Dashboard.jsx      # ダッシュボード
│   │   │   └── Admin.jsx         # 管理パネル
│   │   ├── utils/
│   │   │   ├── api.js            # APIユーティリティ
│   │   │   └── notifications.js  # 通知ユーティリティ
│   │   ├── firebase.js           # Firebase初期化
│   │   ├── App.jsx               # ルーター
│   │   ├── index.css             # スタイル
│   │   └── main.jsx              # エントリーポイント
│   ├── index.html
│   ├── vite.config.js            # Vite設定
│   ├── .env                      # 環境変数
│   ├── .firebaserc               # Firebaseプロジェクト
│   └── firebase.json              # Firebase Hosting設定
│
├── functions/                     # Cloud Functions
│   ├── src/
│   │   ├── models/
│   │   │   ├── Todo.js          # Todoモデル
│   │   │   └── User.js          # Userモデル
│   │   ├── routes/
│   │   │   ├── todos.js         # Todo CRUD
│   │   │   ├── auth.js          # 認証・役割管理
│   │   │   └── admin.js         # 管理機能
│   │   ├── middleware/
│   │   │   └── firebaseAuth.js  # Firebase Auth検証
│   │   ├── utils/
│   │   │   └── email.js         # メール通知ユーティリティ
│   │   └── index.js             # Functionsエントリ
│   ├── package.json
│   ├── firebase.json             # Cloud Functions設定
│   └── .firebaserc              # Firebaseプロジェクト
│
├── server/                        # Express バックエンド（ローカル開発用）
│   ├── src/
│   │   ├── models/
│   │   │   ├── Todo.js           # Todoモデル
│   │   │   ├── User.js           # Userモデル
│   │   │   └── Verification.js   # OTP検証モデル
│   │   ├── routes/
│   │   │   ├── todos.js          # Todo CRUD
│   │   │   ├── auth.js           # 認証・OTP管理
│   │   │   └── admin.js          # 管理機能
│   │   ├── utils/
│   │   │   └── email.js          # メール送信ユーティリティ
│   │   └── index.js              # サーバーエントリ
│   └── package.json
│
├── PROJECT_STATUS.md              # プロジェクト進行状況
└── PROJECT.md                     # このファイル
```

---

## 環境構築

### 前提条件
- Node.js 18以上
- npm または yarn
- MongoDB Atlasアカウント（またはローカルMongoDB）
- Firebaseプロジェクト（本番環境の場合）

### 1. 依存関係インストール

```bash
# バックエンド
cd server
npm install

# フロントエンド
cd client
npm install
```

### 2. 環境変数設定

#### Server (.env)
```bash
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@clustertodolist.ezx6ch3.mongodb.net/?appName=ClusterTodolist

RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
OTP_EXPIRES_MINUTES=5
```

#### Client (.env)
```bash
VITE_API_URL=http://localhost:3001/api
```

### 3. サーバー起動

```bash
# ターミナル1 - サーバー
cd server
npm run dev
```

### 4. クライアント起動

```bash
# ターミナル2 - クライアント
cd client
npm run dev
```

### 5. アクセス

- **通常ユーザー**: http://localhost:5173 → user1@test.com または user2@test.com
- **管理者**: http://localhost:5173 → admin@test.com または admin2@test.com

---

## LANアクセス設定

他のPCからアプリにアクセスする場合：

### 1. Vite設定更新 (client/vite.config.js)
```javascript
server: {
  host: '0.0.0.0',  // LANからのアクセスを許可
  port: 5173
}
```

### 2. サーバー設定
- 既に `0.0.0.0` でリッスンする設定済み（変更不要）

### 3. アクセス
```
http://<服务器的IP地址>:5173
```

### IPアドレス確認
```bash
# Linux
hostname -I

# Windows
ipconfig
```

### ファイアウォール確認
```bash
# Linux (Ubuntu/Debian)
sudo ufw status

# Linux (CentOS/RHEL/Fedora)
sudo firewall-cmd --state
```

---

## APIリファレンス

### 認証API

#### POST /api/auth/send-otp
OTP確認コード生成・メール送信

**Request Body**
```json
{
  "email": "user@example.com"
}
```

**Response**
```json
{
  "success": true,
  "message": "確認コードをメールに送信しました",
  "expiresIn": 300
}
```

**エラーコード**
- 400: 無効なメールアドレス

---

#### POST /api/auth/verify-otp
OTP確認コード検証

**Request Body**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (成功)**
```json
{
  "success": true,
  "isVerified": true,
  "message": "メールアドレスの確認が完了しました"
}
```

**Response (失敗)**
```json
{
  "error": "確認コードが正しくありません（残り4回）",
  "isVerified": false,
  "remainingAttempts": 4
}
```

**エラーコード**
- 400: コード期限切れ / 入力回数上限超過 / コード不正

---

#### POST /api/auth/check-verified
メールアドレス確認状態チェック

**Request Body**
```json
{
  "email": "user@example.com"
}
```

**Response**
```json
{
  "isVerified": true
}
```

---

#### POST /api/auth/verify
トークン検証とユーザー作成/更新

**Request Headers**
```
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "firebaseUid": "user1",
  "email": "user1@test.com",
  "name": "しせい",
  "role": "normal"
}
```

**Response**
```json
{
  "user": {
    "_id": "...",
    "firebaseUid": "user1",
    "email": "user1@test.com",
    "name": "しせい",
    "role": "normal",
    "createdAt": "2026-03-22T..."
  }
}
```

---

#### PUT /api/auth/name
ユーザー名変更

**Request Headers**
```
Authorization: Bearer <token>
```

**Request Body**
```json
{
  "firebaseUid": "user1",
  "name": "新しい名前"
}
```

**Response**
```json
{
  "user": {
    "_id": "...",
    "firebaseUid": "user1",
    "email": "user1@test.com",
    "name": "新しい名前",
    "role": "normal"
  }
}
```

---

### Todo API

#### GET /api/todos
ユーザーのTodo一覧取得（Overdue判定実行）

**Request Headers**
```
Authorization: Bearer <token>
```

**Response**
```json
[
  {
    "_id": "...",
    "title": "Todo Title",
    "description": "Description",
    "status": "pending",
    "deadline": "2026-03-22T14:59:59.999Z",
    "completedAt": null,
    "delayDays": null,
    "reminderSent": false,
    "isDeleted": false,
    "createdAt": "2026-03-22T...",
    "updatedAt": "2026-03-22T..."
  }
]
```

---

#### POST /api/todos
Todo作成

**Request Body**
```json
{
  "title": "New Todo",
  "description": "Description (optional)"
}
```

**自動設定されるフィールド**
- `deadline`: 当日23:59:59
- `status`: "pending"
- `reminderSent`: false

---

#### PUT /api/todos/:id
Todo更新

**Request Body**
```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "status": "completed",
  "completedAt": "2026-03-22",
  "delayDays": 2,
  "reminderSent": true
}
```

**ステータス変更時の動作**
- `delayed` + `delayDays`: Delay機能適用
- `pending`: Delay解除

---

#### DELETE /api/todos/:id
- Normalユーザー: 403 Forbidden
- Superユーザー: 論理削除（`isDeleted: true`）

---

### 管理API (Superユーザーのみ)

#### GET /api/admin/todos
全ユーザーのTodo一覧取得（Overdue判定実行）

---

#### GET /api/admin/users
全ユーザー一覧取得

**Response**
```json
[
  {
    "_id": "...",
    "firebaseUid": "user1",
    "email": "user1@test.com",
    "role": "normal",
    "createdAt": "2026-03-22T..."
  }
]
```

---

#### DELETE /api/admin/:id
論理削除

---

#### PUT /api/admin/:id/restore
削除したTodoを復元

---

## データモデル

### Todo Schema

```javascript
{
  userId: ObjectId,           // 参照: User
  title: String,             // 必須
  description: String,       // 任意
  status: String,            // pending|completed|delayed|abandoned|overdue
  completedAt: Date,         // 完了日時
  delayDays: Number,         // 遅延日数
  delayedAt: Date,           // 遅延適用日時
  deadline: Date,            // 期限（当日23:59:59）
  reminderSent: Boolean,      // リマインダー送信済み
  isDeleted: Boolean,        // 論理削除フラグ
  createdAt: Date,           // 作成日時
  updatedAt: Date            // 更新日時
}
```

### User Schema

```javascript
{
  firebaseUid: String,       // Firebase UID（一意）
  email: String,             // メールアドレス
  name: String,              // ユーザー名（デフォルト: メールアドレスの@前部分）
  role: String,             // normal|super
  createdAt: Date            // 作成日時
}
```

### Verification Schema (OTP管理)

```javascript
{
  email: String,            // メールアドレス（小文字化）
  otp: String,             // 6桁OTPコード
  expiresAt: Date,         // 有効期限（5分後）
  attempts: Number,        // 試行回数（最大5回）
  verified: Boolean,       // 確認済みフラグ
  createdAt: Date          // 作成日時
}
```

※ `expiresAt` フィールドにTTLインデックス設定（自動期限切れ）

---

## ステータス一覧

| ステータス | 色 | 説明 |
|-----------|-----|------|
| pending | 青 (#e3f2fd) | 保留中 |
| overdue | 紫 (#e1bee7) | 期限切れ（自動判定） |
| completed | 緑 (#c8e6c9) | 完了 |
| delayed | オレンジ (#ffe0b2) | 延期中 |
| abandoned | 赤 (#ffcdd2) | 放棄 |

---

## マイグレーション

### deadlineフィールド追加（既存Todo用）

```bash
cd server
node migrations/add-deadline-field.js
```

**動作**:
- deadlineが未設定のTodoを探す
- createdAtの当日23:59:59をdeadlineに設定
- reminderSentをfalseに設定

---

### 旧フィールド削除（古いデータ用）

```bash
cd server
node migrations/remove-time-fields.js
```

**削除フィールド**:
- startTime
- endTime
- reminderMinutes
- lastReminderAt
- overdueReminderCount

---

## 現在の認証方法

### 本番環境
Firebase Auth（実装済み）
- Google Sign-In
- Email/Password 認証（メールOTP確認付き）

### メールOTP認証
新規登録時にメールアドレスの確認を行う6桁の確認コード方式

**メール送信サービス: Resend**
- APIベースで簡単設定
- 每月3,000通無料
- 日本語メール対応

**OTP仕様**
- 桁数: 6桁
- 有効時間: 5分
- 試行回数上限: 5回
- 送信間隔制限: 60秒

### 役割管理
MongoDB（roleフィールド）
- 初回ログイン時に役割を選択（Normal / Super）
- 選択した役割はMongoDBに保存

---

## 既知の問題

| 重大度 | 問題 | 場所 | ステータス |
|--------|------|------|------------|
| 🟡 中 | 入力検証がない | routes/todos.js | 未修正 |
| 🟡 低 | 役割変更機能がない | 役割選択後、変更不可 | 未修正 |
| ✅ | 役割選択画面が表示されないバグ | AuthContext/Login.jsx/App.jsx | 修正済み (2026-03-24) |
| ✅ | ユーザー名が表示されない問題 | AuthContext/Login.jsx/Userモデル | 修正済み (2026-03-27) |
| ✅ | Adminパネルでユーザー名が「Unknown」になる問題 | admin.js/Admin.jsx | 修正済み (2026-03-27) |

---

## 次のステップ（推奨）

1. **最初の管理者作成**
   - Firebaseコンソールで最初のSuperユーザーを確認
   - 必要に応じてMongoDBで直接役割を変更

2. **セキュリティ強化**
   - Firestoreでの役割管理（より安全）
   - カスタムクレームによる役割管理

3. **入力検証の実装**
   - Joi/Yup/Zodなどのバリデーションライブラリ導入

4. **リアルタイム機能**
   - Firestoreでリアルタイム更新
   - Cloud Messagingでプッシュ通知

5. **テスト**
   - Firebase Emulator Suiteでテスト

---

## トラブルシューティング

### MongoDB接続エラー
```
MongoNetworkError: connection timeout
```
- ネットワーク接続確認
- IPアドレスのホワイトリスト設定（Atlas）
- 接続文字列確認

### CORSエラー
```
Access-Control-Allow-Origin error
```
- サーバー側のCORS設定確認
- 環境変数のVITE_API_URL確認

### 通知が届かない
- ブラウザ通知の許可確認
- インカバーグوروーモードではないことを確認

### メール送信エラー
```
Error: Invalid login
```
- SMTP設定確認（SMTP_USER, SMTP_PASS）
- アプリパスワードの設定（Gmailの場合）
- アカウントのセキュリティ設定確認

---

### 2026-03-31: 日次サマリーメール機能追加

#### 概要
毎日23時に前日のTodo作成数、完了数、期限切れ数、延期数、放棄数、完了率をまとめたメールを管理者に送信する機能。

#### 実装方式
GitHub Actionsを使用して每日23時（日本時間）にAPIをコール

#### 追加ファイル
- `.github/workflows/daily-summary.yml` - GitHub Actions ワークフロー
- `server/src/routes/dailySummary.js` - 日次サマリーAPIルート
- `functions/src/routes/dailySummary.js` - Cloud Functions用ルート

#### 修正ファイル
- `server/src/utils/email.js` - sendDailySummaryEmail関数追加
- `functions/src/utils/email.js` - sendDailySummaryEmail関数追加
- `server/src/index.js` - dailySummaryルート登録
- `functions/index.js` - dailySummaryルート登録

#### APIエンドポイント
| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `/api/daily-summary/send` | POST | 日次サマリーメール送信 |

#### メール内容
- 作成数: 本日に作成したTodo数
- 完了数: 本日に完了にしたTodo数
- 期限切れ数: 本日に期限切れになったTodo数
- 延期数: 本日に延期したTodo数
- 放棄数: 本日に放棄にしたTodo数
- 完了率: 完了数 / (完了数 + 期限切れ数 + 延期数 + 放棄数)

#### 受信者
- chen.qiangqiang@outlook.com
- seth.chen@outlook.com

#### GitHub Secrets設定
```
DAILY_SUMMARY_API_URL: https://api.example.com/api/daily-summary/send
DAILY_SUMMARY_SECRET: <任意のシークレットキー>
```

#### Cron仕様
- 日本時間10時30分 = UTC1時30分
- Cron: `30 1 * * *`

---

## 実装履歴

### 2026-03-27: ユーザー名表示機能

#### 問題
1. ユーザー名が「Unknown」と表示される
2. Adminパネルで他のユーザーのTodoが「Unknown」にまとめられる

#### 原因分析
1. `loginWithFirebase()` で `firebaseUser.displayName` が `null` のまま
2. `admin.js` の `populate` が `email` フィールドのみ
3. `Admin.jsx` の `userId` 比較ロジックが不正

#### 修正内容

##### バックエンド（server/functions）
1. **Userモデル** (`src/models/User.js`)
   - `name` フィールド追加（デフォルト: 空文字列）

2. **認証ルート** (`src/routes/auth.js`)
   - `/verify` エンドポイントで `name` パラメータ処理
   - `/name` エンドポイント追加（名前変更用）
   - `/role` エンドポイントで `name` を返すように修正

3. **Adminルート** (`src/routes/admin.js`)
   - `populate('userId', 'email name')` に修正

##### クライアント（client）
1. **Login.jsx**
   - `loginWithFirebase(result.user, displayName)` に修正
   - `displayName` をパラメータとして渡す

2. **AuthContext.jsx**
   - `loginWithFirebase(firebaseUser, providedName = null)` に修正
   - `providedName` を優先的に使用

3. **Dashboard.jsx**
   - ヘッダーにユーザー名表示（太字）

4. **Admin.jsx**
   - `groupedByUser` ロジック修正
   - `populate` された `email` を直接使用

5. **userApi.js**
   - `verify()` に `name` パラメータ追加
   - `updateName()` 関数追加

#### デプロイ
- ローカル環境（server/）: 修正済み
- 本番環境（functions/）: 修正済み
- クライアント（client/）: 修正済み

#### テスト結果
- 新規登録で名前入力 → MongoDB に正しく保存される
- ヘッダーにユーザー名表示される
- Adminパネルでユーザー名（メールアドレス）表示される

---

### 2026-03-27: Todo作成通知機能削除

#### 削除内容
- Dashboard.jsxからcreationNotification state、通知設定、通知UIを削除

#### デプロイ
- クライアント（client/）: 削除完了

---

### 2026-03-27: Todo作成時メール通知機能追加

#### 追加内容
- Todo作成時にSuperユーザーへメール通知
- Resendを使用したメール送信
- 本物メールアドレス持有者のSuperユーザーのみ受信
- メール内容：作成者名、タイトル、説明文

#### 追加ファイル
- `functions/src/utils/email.js` - メール通知ユーティリティ

#### 修正ファイル
- `server/src/utils/email.js` - sendTodoCreatedNotification関数追加
- `server/src/routes/todos.js` - Todo作成時にメール送信
- `functions/src/routes/todos.js` - Todo作成時にメール送信
- `functions/package.json` - resend依存関係追加

#### デプロイ
- ローカル環境（server/）: 追加完了
- 本番環境（functions/）: 追加完了

---

### 2026-03-27: Todoステータス変更メール通知機能追加

#### 追加内容
- Todoのステータス変更時にSuperユーザーにメール通知
- Resendを使用したメール送信
- メール内容：作成者名、Todoタイトル、変更前ステータス、変更後ステータス

#### 追加ファイル
- `server/src/utils/email.js` - sendTodoStatusChangedNotification関数追加

#### 修正ファイル
- `server/src/routes/todos.js` - ステータス変更時にメール送信呼び出し追加
- `server/src/utils/email.js` - メール送信関数修正

#### 受信者について
- 当初予定: chen.qiangqiang@outlook.com, seth.chen@outlook.com
- Resend無料プラン制限により、一時的にseth.chen@outlook.comのみに送信
- 原因: "You can only send testing emails to your own email address"

#### ドメイン取得・DNS設定
- ドメイン: cshrpro.com（Cloudflareで取得）
- DNS設定: CloudflareでResendのレコードを追加
  - TXT (resend._domainkey): DKIM検証用
  - TXT (send): SPF設定
  - MX (send): メール受信用
  - TXT (_dmarc): DMARC設定
- ステータス: DNS反映待ち（ResendでVerified待ち）

#### 今後の予定
- Resendでドメイン(cshrpro.com)検証完了後、EMAIL_FROMをnoreply@cshrpro.comに変更
- 受信者をchen.qiangqiang@outlook.comとseth.chen@outlook.comに戻す

---

### 2026-03-29: カスタムドメイン設定（todo.cshrpro.com）

#### 問題
Firebase Hostingにカスタムドメイン（todo.cshrpro.com）を追加後、SSL証明書が有効になる前にHTTPSアクセスでエラーが発生
- エラー内容: `SSL: no alternative certificate subject name matches target host name`

#### 原因
FirebaseがカスタムドメインのSSL証明書をプロビジョニングするまで時間がかかった（数分〜最大24時間）

#### 解決方法
1. Firebase Console > Hosting > カスタムドメインで `todo.cshrpro.com` を追加
2. CloudflareでDNS CNAMEレコードを設定（`todo.cshrpro.com` → `sethtodo-a6ea4.web.app`）
3. SSL証明書の自動プロビジョニングを待機

#### DNS設定内容
- レコードタイプ: CNAME
- 名前: todo
- ターゲット: sethtodo-a6ea4.web.app
- プロキシステータス: DNSのみ（Cloudflareプロキシは使用せず）

#### 結果
- DNS解決: ✅ 正常（`todo.cshrpro.com` → `sethtodo-a6ea4.web.app`）
- SSL証明書: ✅ 有効（Firebaseにより自動プロビジョニング完了）
- アクセスURL: https://todo.cshrpro.com


### 2026-03-29: サブスクリプション（月額/年額）機能追加

#### 概要
有料会員制度（サブスクリプション）を導入し、サブスクリプション会員に特別な機能を提供。

#### 会員プラン

| プラン | 価格 | 機能 |
|-------|------|------|
| Free | 無料 | 基本機能 |
| Monthly | 月額 | Todo削除 + 週間グラフ |
| Yearly | 年額 | Todo削除 + 週間グラフ |

#### 機能詳細

##### 1. Todo削除機能
- **対象者**: サブスクリプション会員（月額/年額）
- **内容**: 自分のTodoを論理削除（isDeleted: true）できる
- **権限フロー**:
  - Superユーザー → 何でも削除可能
  - サブスク会員 → 自分のTodoのみ削除可能
  - Freeユーザー → 削除不可（403 Forbidden）

##### 2. 週間グラフ
- **対象者**: 全ユーザー
- **内容**: 過去1週間のTodo状況を折れ線グラフで表示
- **グラフ内容**:
  - X軸: 過去7日間（日〜土）
  - Y軸（左）: 各ステータスのTodo数
  - Y軸（右）: 完了率（%）
  - 折れ線4本: 完了数・延期数・期限切れ数・放棄数
- **使用ライブラリ**: chart.js + react-chartjs-2

#### データベース変更

**Userモデル更新:**
```javascript
subscription: {
  plan: { type: String, enum: [\free, \monthly, \yearly], default: \free },
  status: { type: String, enum: [\active, \canceled, \past_due, \none], default: \none },
  currentPeriodEnd: { type: Date },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String }
}
```

#### APIエンドポイント

##### サブスクリプション関連
| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `/api/subscription/status` | GET | ユーザーのサブスク状況取得 |
| `/api/subscription/create-checkout` | POST | Stripeチェックアウトセッション作成 |
| `/api/subscription/portal` | POST | Stripe顧客ポータルURL生成 |
| `/api/subscription/webhook` | POST | Stripeウェブフック受取 |

##### 週間グラフ関連
| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `/api/todos/weekly-stats` | GET | 過去7日分のTodo統計データ取得 |

**週間統計レスポンス形式:**
```json
{
  "days": [
    { "date": "2026-03-23", "completed": 5, "delayed": 1, "overdue": 2, "abandoned": 0 }
  ],
  "totalCompleted": 20,
  "totalDelayed": 3,
  "totalOverdue": 5,
  "totalAbandoned": 1,
  "completionRate": 68.9
}
```

#### 実装ファイル

```
server/
├── src/models/User.js              # subscriptionフィールド追加
├── src/routes/
│   ├── subscription.js             # 新規：サブスクAPI
│   └── todos.js                    # 修正：削除権限・週間統計追加
├── src/middleware/
│   └── subscriptionAuth.js        # 新規：サブスク有効チェック
└── src/utils/stripe.js            # 新規：Stripeユーティリティ

functions/
├── src/models/User.js              # subscriptionフィールド追加
├── src/routes/
│   ├── subscription.js             # 新規：サブスクAPI
│   └── todos.js                    # 修正：削除権限・週間統計追加
└── src/utils/stripe.js            # 新規：Stripeユーティリティ

client/
├── src/context/
│   └── SubscriptionContext.jsx  # 新規：サブスク状態管理
├── src/pages/
│   ├── Pricing.jsx              # 新規：料金プランページ
│   ├── Subscription.jsx        # 新規：サブスク管理ページ
│   └── Dashboard.jsx           # 修正：削除ボタン・グラフ追加
├── src/components/
│   ├── WeeklyChart.jsx         # 新規：週間グラフコンポーネント
│   ├── TodoItem.jsx            # 修正：削除ボタン追加
│   └── SubscriptionBadge.jsx   # 新規：Premiumバッジ
└── src/utils/api.js            # 修正：新しいAPI対応
```

#### Stripe連携

- **公式サイト**: https://stripe.com
- **ダッシュボード**: https://dashboard.stripe.com
- **テストモード**: https://dashboard.stripe.com/test
- **ドキュメント**: https://stripe.com/docs

**Stripe環境変数:**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
```

#### 実装状況

| 項目 | ステータス |
|------|-----------|
| Userモデル更新（server） | 未着手 |
| Userモデル更新（functions） | 未着手 |
| 週間統計API（server） | 未着手 |
| 週間統計API（functions） | 未着手 |
| 削除権限チェック（server） | 未着手 |
| 削除権限チェック（functions） | 未着手 |
| サブスクAPI実装 | 未着手 |
| Stripe設定 | 未着手 |
| フロントエンド週間グラフ | 未着手 |
| フロントエンド削除ボタン | 未着手 |
| Pricingページ | 未着手 |
| Subscriptionページ | 未着手 |
| PROJECT.md更新 | ✅ 完了 |

#### 今後の予定
1. Stripeアカウント設定（テストモード）
2. バックエンドAPI実装
3. フロントエンドUI実装
4. テスト・検証
5. 本番デプロイ


---

## ライセンス

MIT License

---

## 作成者

Dodo Todo App Development Team
