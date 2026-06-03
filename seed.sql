import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined)
    return <div style={wrap}>読み込み中…</div>;
  if (!session) return <Login />;
  return children;
}

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setErr(""); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) setErr("メールアドレスかパスワードが違います。");
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontFamily: "'Shippori Mincho B1', serif", fontSize: 24, fontWeight: 700, color: "#34564E" }}>
          予約管理
        </div>
        <div style={{ fontSize: 11, letterSpacing: ".16em", color: "#7A6F64", marginBottom: 22 }}>
          STAFF LOGIN
        </div>
        <input style={input} placeholder="メールアドレス" value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <input style={input} type="password" placeholder="パスワード" value={pw}
          onChange={(e) => setPw(e.target.value)} autoComplete="current-password"
          onKeyDown={(e) => e.key === "Enter" && signIn()} />
        {err && <div style={{ color: "#B05B47", fontSize: 12, marginBottom: 10 }}>{err}</div>}
        <button style={btn} disabled={busy} onClick={signIn}>
          {busy ? "確認中…" : "ログイン"}
        </button>
        <div style={{ fontSize: 11, color: "#9c9389", marginTop: 16, lineHeight: 1.6 }}>
          スタッフのアカウントはSupabaseの管理画面（Authentication → Users）で発行します。
        </div>
      </div>
    </div>
  );
}

const wrap = {
  minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
  background: "#F5EFE4", fontFamily: "'Zen Kaku Gothic New', sans-serif", padding: 20,
};
const card = {
  background: "#fff", border: "1px solid #E4DCCE", borderRadius: 18,
  padding: "34px 30px", width: "100%", maxWidth: 360,
};
const input = {
  width: "100%", fontSize: 14, padding: "11px 13px", marginBottom: 12,
  border: "1px solid #E4DCCE", borderRadius: 10, fontFamily: "inherit", outline: "none",
};
const btn = {
  width: "100%", background: "#34564E", color: "#F5EFE4", border: "none",
  borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer",
  fontFamily: "inherit",
};
