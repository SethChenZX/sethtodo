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

### 管理機能（Superユーザーのみ）
- [x] 全ユーザーのTodo閲覧
- [x] Todo削除（論理削除）
- [x] Todo復元
- [x] ユーザー一覧表示
- [x] ステータス別カウント表示

### UI/UX
- [x] レスポンシブデザイン
- [x] 紫色（Purple）のOverdue表示
- [x] ステータス別カラー表示
- [x] 日本語対応（Locale: ja-JP）

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
    "role": "normal",
    "createdAt": "2026-03-22T..."
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

## ライセンス

MIT License

---

## 作成者

Dodo Todo App Development Team
