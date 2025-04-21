{`import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function TeamBrowser() {
  const teams = useQuery(api.teams.listTeams) || [];
  const joinTeam = useMutation(api.teams.joinTeam);
  const [joining, setJoining] = useState<string | null>(null);

  async function handleJoin(teamId: string) {
    setJoining(teamId);
    try {
      await joinTeam({ teamId });
      alert("You have joined the team!");
    } catch (err: any) {
      alert(err.message || "Could not join team.");
    } finally {
      setJoining(null);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Browse Teams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <div key={team._id} className="border p-4 rounded">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">{team.name}</span>
              <span className="text-gray-500">
                {team.members.length} members
              </span>
            </div>
            <div className="text-gray-700">{team.description}</div>
            {team.projectIdea && (
              <div>
                <span className="font-semibold">Project Idea:</span>
                <p className="text-gray-600">{team.projectIdea}</p>
              </div>
            )}
            <div>
              <span className="font-semibold">Members:</span>
              <ul className="ml-4">
                {team.members.map((member) => (
                  <li key={member.userId}>
                    {member.email}{" "}
                    {member.role === "Captain" && (
                      <span className="text-xs text-blue-600">(Captain)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-semibold">Votes:</span> {team.voteCount}
            </div>
            <button
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
              onClick={() => handleJoin(team._id)}
              disabled={joining === team._id}
            >
              {joining === team._id ? "Joining..." : "Join Team"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
`}
