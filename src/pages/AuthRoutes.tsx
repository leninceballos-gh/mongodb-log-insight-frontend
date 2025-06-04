import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import OrgSelector from "./OrgSelector";

export default function AuthRoutes() {
  const [session, setSession] = useState(null);
  const [step, setStep] = useState<"signIn" | "signUp" | "orgSelector">("signIn");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session?.user) {
      // Check if user is verified
      if (!session.user.email_confirmed_at) {
        alert("Please verify your email before signing in.");
        supabase.auth.signOut();
        return;
      }
      // Check if user has multiple orgs
      fetch(`/api/get-organizations?user_id=${session.user.id}`)
        .then((res) => res.json())
        .then((orgs) => {
          if (orgs.length === 1) {
            localStorage.setItem("organization_id", orgs[0].id);
            navigate("/dashboard");
          } else {
            setStep("orgSelector");
          }
        });
    }
  }, [session]);

  if (step === "signUp") return <SignUp onSwitch={() => setStep("signIn")} />;
  if (step === "orgSelector") return <OrgSelector user={session?.user} />;
  return <SignIn onSwitch={() => setStep("signUp")} />;
}
