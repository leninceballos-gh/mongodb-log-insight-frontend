import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OrgSelector({ user }: { user: any }) {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/get-organizations?user_id=${user.id}`)
      .then((res) => res.json())
      .then(setOrgs);
  }, [user]);

  const selectOrg = () => {
    localStorage.setItem("organization_id", selected);
    navigate("/dashboard");
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Select Organization</h2>
      <select
        className="w-full border px-4 py-2 rounded"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Choose...</option>
        {orgs.map((org) => (
          <option key={org.id} value={org.id}>{org.name}</option>
        ))}
      </select>
      <button
        onClick={selectOrg}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={!selected}
      >
        Continue
      </button>
    </div>
  );
}
