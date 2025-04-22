import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

function TeamChat({ teamId }: { teamId: Id<"teams"> }) {
  const [comment, setComment] = useState("");
  const comments = useQuery(api.teams.getComments, { teamId }) || [];
  const members = useQuery(api.teams.getTeamMembers, { teamId }) || [];
  const addComment = useMutation(api.teams.addComment);

  async function handleAddComment() {
    if (!comment.trim()) return;
    try {
      await addComment({ teamId, content: comment });
      setComment("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }

  function getMemberProfile(userId: Id<"users">) {
    const member = members.find(m => m.userId === userId);
    return member?.profile;
  }

  if (!comments.length && !members.length) {
    return null;
  }

  return (
    <div className="bg-gray-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Team Chat</h4>
          <div className="text-sm text-gray-500">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="bg-white rounded-lg border h-96 flex flex-col">
          <div className="border-b p-3 flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="Write a message..."
              className="flex-1 min-w-0 bg-gray-50 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddComment}
              className="bg-indigo-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {[...comments].reverse().map((comment) => {
              const profile = getMemberProfile(comment.userId);
              return (
                <div key={comment._id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    {profile?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="font-medium text-sm">{profile?.name || 'Unknown User'}</p>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment._creationTime)}
                      </span>
                    </div>
                    <p className="text-gray-900 break-words">{comment.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Teams() {
  const teams = useQuery(api.teams.myTeams);
  const joinTeam = useMutation(api.teams.joinTeam);
  const leaveTeam = useMutation(api.teams.leaveTeam);

  async function handleJoinTeam(teamId: Id<"teams">) {
    try {
      await joinTeam({ teamId });
      toast.success("Joined team!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join team");
    }
  }

  async function handleLeaveTeam(teamId: Id<"teams">) {
    try {
      await leaveTeam({ teamId });
      toast.success("Left team");
    } catch (error: any) {
      toast.error(error.message || "Failed to leave team");
    }
  }

  const allTeams = useQuery(api.teams.list) || [];
  const myTeamIds = new Set((teams || []).map(team => team._id));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Teams</h2>
        <div className="space-y-4">
          {teams?.map((team) => (
            <div key={team._id} className="border rounded-lg overflow-hidden">
              <div className="bg-white p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{team.name}</h3>
                    <p className="text-gray-600">{team.description}</p>
                  </div>
                  {team.captainId !== team.members[0] && (
                    <button
                      onClick={() => handleLeaveTeam(team._id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Leave Team
                    </button>
                  )}
                </div>
              </div>
              <TeamChat teamId={team._id} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Available Teams</h2>
        <div className="space-y-4">
          {allTeams
            .filter(team => !myTeamIds.has(team._id))
            .map((team) => (
              <div key={team._id} className="border rounded-lg overflow-hidden">
                <div className="bg-white p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{team.name}</h3>
                      <p className="text-gray-600">{team.description}</p>
                    </div>
                    <button
                      onClick={() => handleJoinTeam(team._id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Join Team
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
