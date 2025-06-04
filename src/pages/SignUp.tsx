import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SignUp({ onSwitch }: { onSwitch: () => void }) {
  const [form, setForm] = useState({
    orgName: "",
    orgPhone: "",
    orgAddress: "",
    orgCountry: "",
    orgState: "",
    orgCity: "",
    fullName: "",
    email: "",
    phone: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) return;

    // Save organization and link user
    await fetch("/api/create-organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        ...form
      })
    });

    alert("Account created. Please verify your email before logging in.");
    setLoading(false);
    onSwitch();
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Create Account</h2>
      {Object.entries(form).map(([key, val]) => (
        <input
          key={key}
          className="w-full border px-4 py-2 rounded"
          name={key}
          placeholder={key.replace(/([A-Z])/g, " $1")}
          value={val}
          onChange={handleChange}
        />
      ))}
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Sign Up"}
      </button>
      <p className="text-sm text-center">
        Already have an account? <button onClick={onSwitch} className="underline">Sign in</button>
      </p>
    </div>
  );
}
