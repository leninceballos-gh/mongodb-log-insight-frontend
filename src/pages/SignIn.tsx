import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SignIn({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Sign In</h2>
      <input
        className="w-full border px-4 py-2 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="w-full border px-4 py-2 rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleSignIn}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Sign In
      </button>
      <p className="text-sm text-center">
        Don’t have an account? <button onClick={onSwitch} className="underline">Sign up</button>
      </p>
    </div>
  );
}
