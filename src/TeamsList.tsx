import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function TeamsList() {
  const teams = useQuery(api.teams.list);
  const vote = useMutation(api.teams.vote);

  if (!teams) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">All Teams</h2>
      <div className="space-y-4">
        {teams.map((team) => (
          <div key={team._id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">{team.name}</h3>
              <p className="text-gray-600">{team.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{team.votes} votes</span>
              <button
                onClick={() => vote({ teamId: team._id })}
                className="bg-indigo-600 text-white py-1 px-3 rounded hover:bg-indigo-700"
              >
                Vote
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
