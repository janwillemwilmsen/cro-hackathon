{`import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Props = {
  onSelectTeam?: (teamId: string) => void;
};

export default function TeamList({ onSelectTeam }: Props) {
  const teams = useQuery(api.teams.listTeams) || [];
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Your Teams</h2>
      <ul>
        {teams.map((team) => (
          <li key={team._id} className="mb-4 border p-2 rounded">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">{team.name}</span>
                <span className="ml-2 text-gray-500">
                  ({team.members.length} members)
                </span>
              </div>
              {onSelectTeam && (
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => onSelectTeam(team._id)}
                >
                  View
                </button>
              )}
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
          </li>
        ))}
      </ul>
    </div>
  );
}
`}
