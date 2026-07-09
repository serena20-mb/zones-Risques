import React, { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();
    const res = await axios.post("[localhost](http://localhost:5000/api/auth/login)", {
      email,
      password
    });
    alert(res.data.message);
  };

  return (
    <div>
      <h2>Connexion</h2>
      <form onSubmit={login}>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input placeholder="Mot de passe" type="password" onChange={e => setPassword(e.target.value)} />
        <button>Se connecter</button>
      </form>

      <button style={{ marginTop: 10 }}>
        🔵 Connexion avec Google
      </button>
    </div>
  );
}
