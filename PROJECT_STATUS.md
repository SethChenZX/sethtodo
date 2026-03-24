# Dodo Todo App - プロジェクト進行状況

**最終更新**: 2026年3月24日 (役割選択画面バグ修正)

## 📊 プロジェクト概要

フルスタックのTodoアプリケーション。Firebase Authによる認証をサポートし、Google Sign-In + Email/Passwordでログイン可能。

## ✅ 完了済み機能

### バックエンド (Cloud Functions - functions/)
- [x] Cloud Functions 設定 (`index.js`)
- [x] MongoDB接続 (`mongoose`)
- [x] Userモデル (`src/models/User.js`)
- [x] Todoモデル (`src/models/Todo.js`)
- [x] Todo CRUD API (`src/routes/todos.js`)
- [x] 認証API (`src/routes/auth.js`)
- [x] 管理者API (`src/routes/admin.js`)
- [x] Firebase Auth トークン検証 (`src/middleware/firebaseAuth.js`)
- [x] 役割更新API (`PUT /auth/role`)

### フロントエンド (client/)
- [x] React + Viteプロジェクト構成
- [x] Firebase Auth SDK設定 (`firebase.js`)
- [x] 認証コンテキスト (`src/context/AuthContext.jsx`)
- [x] ログインページ (`src/pages/Login.jsx`)
  - Google Sign-Inボタン
  - Email/Password ログイン
  - Email/Password 新規登録
- [x] 役割選択ページ (`src/pages/SelectRole.jsx`)
- [x] ダッシュボードページ (`src/pages/Dashboard.jsx`)
- [x] 管理パネル (`src/pages/Admin.jsx`)
- [x] ステータスベースのフィルター機能
- [x] レスポンシブCSSスタイル
- [x] Firebase Hosting & Cloud Functions 連携設定

### 認証機能
- [x] Firebase Auth統合
- [x] Google Sign-In
- [x] Email/Password 認証
- [x] 役割選択（Normal / Super）
- [x] セッション管理

### Todo管理機能
- [x] 完了日付機能（Normalユーザーのみ）
- [x] 完了日付フィルター（Dashboard & Admin）
- [x] Delay機能（Normalユーザーのみ）
- [x] Delayフィルター（Dashboard & Admin）
- [x] 削除権限変更
  - NormalユーザーはTodoを削除できない
  - SuperユーザーはAdminパネルから削除可能
  - 論理削除（`isDeleted` フィールド）で削除管理
  - 削除済みTodoの表示と復元機能
- [x] Deadline機能
  - Todo作成時に自動的に当日23:59:59を期限に設定
  - 期限切れのpending Todoは自動的にoverdueステータスに変更
  - 期限表示（Dashboard & Admin双方）
  - 期限切れTodoフィルター追加
  - 紫色（purple）のUI表示
- [x] リマインダー機能
  - 期限5分前に通知ポップアップ表示
  - Browser Notification API + インアプリモーダル

### 削除した機能
- [x] 開始時間・終了時間フィールド

### 🔧 バグ修正 (2026-03-24)
- [x] 役割選択画面が表示されないバグを修正
  - AuthContext.jsx: `dbUser?.role` が `undefined` の場合に `null` を返すように修正
  - Login.jsx/App.jsx: `null` と `undefined` の両方をチェックするように更新
  - Renderにデプロイ済み

## 🔄 現在の認証方法

- **本番**: Firebase Auth
  - Google Sign-In
  - Email/Password
- **役割管理**: MongoDB（roleフィールド）

## 📁 プロジェクト構造

```
todo/
├── client/                         # React + Vite フロントエンド
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Firebase Auth コンテキスト
│   │   ├── pages/
│   │   │   ├── Login.jsx         # ログイン画面
│   │   │   ├── SelectRole.jsx    # 役割選択画面
│   │   │   ├── Dashboard.jsx      # ダッシュボード
│   │   │   └── Admin.jsx         # 管理パネル
│   │   ├── utils/
│   │   │   ├── api.js            # APIユーティリティ
│   │   │   └── notifications.js  # 通知ユーティリティ
│   │   ├── firebase.js           # Firebase初期化
│   │   ├── App.jsx               # ルーター
│   │   └── index.css             # スタイル
│   ├── .env                      # 環境変数
│   ├── .firebaserc               # Firebaseプロジェクト
│   └── firebase.json             # Firebase Hosting設定
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
│   │   │   └── firebaseAuth.js   # Firebase Auth検証
│   │   └── index.js             # Functionsエントリ
│   ├── package.json
│   ├── firebase.json             # Cloud Functions設定
│   └── .firebaserc              # Firebaseプロジェクト
│
├── server/                        # Express バックエンド（ローカル開発用）
│   └── ...
│
├── PROJECT_STATUS.md              # このファイル
└── PROJECT.md                     # 詳細なドキュメント
```

## 🚀 Firebase デプロイ手順

### 1. Firebase Console 設定

#### Authentication 有効化
```
Firebase Console > Authentication > Sign-in method
```
- [x] **Email/Password** を有効化
- [x] **Google** を有効化

#### Cloud Functions API 有効化
```
Google Cloud Console > APIs & Services > Cloud Functions API
```

### 2. 環境変数設定

#### MongoDB URI 設定
```bash
cd functions
firebase functions:config:set mongodb.uri="mongodb+srv://xx:shisei1221@clustertodolist.ezx6ch3.mongodb.net/?appName=ClusterTodolist"
```

### 3. 依存関係インストール

```bash
# Cloud Functions
cd functions
npm install

# Frontend
cd ../client
npm install
```

### 4. ローカルテスト（Cloud Functions エミュレーター）

```bash
# functionsディレクトリでエミュレーター起動
cd functions
npx firebase emulators:start --only functions
```

**注意**: エミュレーターのURLパターン:
```
http://127.0.0.1:5001/sethtodo-a6ea4/us-central1/api
```

**クライアント側の.env**:
```
VITE_API_URL=http://127.0.0.1:5001/sethtodo-a6ea4/us-central1/api
```

### 5. MongoDB環境変数設定（本番）

```bash
cd functions
firebase functions:config:set mongodb.uri="mongodb+srv://xx:shisei1221@clustertodolist.ezx6ch3.mongodb.net/?appName=ClusterTodolist"
```

### 6. デプロイ

```bash
# Firebaseにログイン
cd functions
npx firebase login

#  фронтендビルド
cd ../client
npm run build

# デプロイ（Functions + Hosting）
cd ..
npx firebase deploy --only functions,hosting
```

### 7. アクセス

- **本番URL**: `https://sethtodo-a6ea4.web.app`
- **Functions URL**: `https://us-central1-sethtodo-a6ea4.cloudfunctions.net/api`

### 8. 最初の管理者設定

1. アプリにログイン（GoogleまたはEmail/Password）
2. 役割選択で「管理者 (Super)」を選択
3. 完了

## 🛠️ 必要な環境変数

### Client (.env)
```
VITE_FIREBASE_API_KEY=AIzaSyAfgtkSBb5KAY8axcu7xB_jp1x3PFYOWGs
VITE_FIREBASE_AUTH_DOMAIN=sethtodo-a6ea4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sethtodo-a6ea4
VITE_FIREBASE_STORAGE_BUCKET=sethtodo-a6ea4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=723368132517
VITE_FIREBASE_APP_ID=1:723368132517:web:548c659439ad6b4aab324c
VITE_FIREBASE_MEASUREMENT_ID=G-FFNLLKE9H1
VITE_API_URL=http://localhost:5001/sethtodo-a6ea4/us-central1/api
```

### Cloud Functions 環境変数
```bash
firebase functions:config:set mongodb.uri="your-mongodb-uri"
```

## 🌐 LANアクセス設定（ローカル開発時）

### 起動手順

**ターミナル1 - Cloud Functions エミュレータ**
```bash
cd functions
npm run serve
```

**ターミナル2 - クライアント起動**
```bash
cd client
npm run dev
```

### 他のPCからのアクセス
```
http://<PCのIPアドレス>:5173
```

IPアドレス確認コマンド：
```bash
hostname -I   # Linux
ipconfig      # Windows
```

## 📝 次のステップ（推奨）

1. **最初の管理者作成**
   - Firebaseコンソールで最初のSuperユーザーを確認

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

## 🗄️ MongoDB マイグレーション

### Deadline & Overdue マイグレーション
既存のTodoにdeadlineを追加：

```bash
cd server
node migrations/add-deadline-field.js
```

### 論理削除フィールドについて
- Normalユーザーの削除リクエストはサーバー側でブロック（403エラー）
- Superユーザーは論理削除可能（`isDeleted: true`）
- 削除済みTodoはAdminパネルでのみ表示/復元可能

### Deadline & Overdue フィールド
- `deadline`: Todo作成時に自動的に当日23:59:59に設定
- `reminderSent`: リマインダー通知送信済みフラグ
- `overdue`: ステータスに追加された新しい状態
