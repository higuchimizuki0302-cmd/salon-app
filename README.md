# 予約管理アプリ — 本番セットアップ手順

このフォルダは、試作で見ていただいた予約管理アプリを **本物のアプリ** として
公開するための一式です。見た目・機能はそのまま、データは **Supabase**(データベース)に保存され、
**Vercel** で公開してスマホ/PCのブラウザから数人で共有して使えます。

---

## できること（おさらい）
- 13項目の予約フォーム入力（①名前 〜 ⑬メモ）
- 仮予約 / 予約確定、来店済み / キャンセル / 無断キャンセル
- **来店が明日なのに仮予約のままの人をアラート表示**
- 月別来店数・担当別・年代分布などの自動集計
- ログインしたスタッフだけが閲覧・編集（顧客情報を保護）
- 複数人の編集が即反映（リアルタイム同期）

---

## 必要なもの（すべて無料で始められます）
1. パソコン（Windows / Mac どちらでも可）
2. [Node.js](https://nodejs.org/) … LTS版をインストール
3. アカウント3つ … [GitHub](https://github.com) / [Supabase](https://supabase.com) / [Vercel](https://vercel.com)

エンジニアに任せる場合は、このフォルダごと渡せばそのまま進められます。

---

## 手順

### 1. データベースを用意する（Supabase）
1. Supabase にログインし「New project」でプロジェクトを作成（リージョンは Tokyo 推奨）。
2. 左メニューの **SQL Editor** を開き、`supabase/schema.sql` の中身を貼り付けて **Run**。
3. 続けて `supabase/seed.sql` の中身を貼り付けて **Run**。
   → これで既存の予約139件がデータベースに入ります。
4. 左下の **Project Settings → API** を開き、次の2つを控える。
   - **Project URL**
   - **anon public** キー

### 2. スタッフのログイン用アカウントを作る
1. Supabase 左メニュー **Authentication → Users → Add user**。
2. スタッフ分のメールアドレスとパスワードを登録（人数分くり返す）。
   → ここで作った人だけがアプリにログインできます。

### 3. パソコンで動かしてみる
1. このフォルダをパソコンに置き、ターミナル（コマンド画面）で開く。
2. `.env.example` をコピーして **`.env`** という名前にし、1-4で控えた値を書き込む。
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
3. 次を順番に実行：
   ```
   npm install
   npm run dev
   ```
4. 表示された `http://localhost:5173` をブラウザで開く。
   → ログイン画面が出れば成功。2で作ったメール/パスワードで入れます。

### 4. インターネットに公開する（Vercel）
1. このフォルダを GitHub にアップロード（リポジトリを作成して push）。
2. Vercel にログイン →「Add New… → Project」→ 先ほどのリポジトリを選択。
3. **Environment Variables** に `.env` と同じ2つ（URL と anon キー）を登録。
4. **Deploy** を押す。数分で `https://〇〇.vercel.app` のURLが発行されます。
5. そのURLをスタッフに共有すれば完成。スマホのホーム画面に追加すればアプリのように使えます。

（独自ドメイン `app.あなたの店.com` も Vercel の Settings から後で設定できます）

---

## 構成ファイル
- `src/App.jsx` … アプリ本体（画面・集計・アラート）
- `src/AuthGate.jsx` … ログイン画面と認証
- `src/supabaseClient.js` … データベース接続
- `supabase/schema.sql` … テーブルと権限の作成
- `supabase/seed.sql` … 既存139件の投入データ
- `.env.example` … 接続情報のひな形

---

## よくあるつまずき
- **ログインできない** → Supabaseの Authentication → Users にそのユーザーを登録したか確認。
- **真っ白／データが出ない** → `.env`（やVercelの環境変数）のURL・キーが正しいか確認。
- **項目を増やしたい** → フォームの項目は `src/App.jsx` の Modal 部分に追記すればOK（DB側は JSONB なので変更不要）。

行き詰まったら、エラーメッセージをそのまま聞いてください。一緒に直します。
