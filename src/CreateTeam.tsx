import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function CreateTeam() {
  const createTeam = useMutation(api.teams.create);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTeam({ name, description });
      setName("");
      setDescription("");
      toast.success("Team created!");
      // Could add navigation here if needed
    } catch (error) {
      toast.error("Failed to create team");
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create a Team</h2>
      <form onSubmit={handleCreateTeam} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Team Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
        >
          Create Team
        </button>
      </form>
    </div>
  );
}
