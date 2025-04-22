import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { SignOutButton } from "./SignOutButton";
import { Id } from "../convex/_generated/dataModel";

export function Profile() {
  const profile = useQuery(api.profiles.get, {});
  const updateProfile = useMutation(api.profiles.update);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);
  const saveImage = useMutation(api.profiles.saveImage);
  const teams = useQuery(api.teams.list) || [];
  const myTeams = useQuery(api.teams.myTeams) || [];
  const joinTeam = useMutation(api.teams.joinTeam);
  const leaveTeam = useMutation(api.teams.leaveTeam);
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<Id<"teams"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is a team captain
  const userTeam = myTeams[0]; // User can only be in one team
  const isCaptain = userTeam?.captainId === profile?.userId;

  // Update local state when profile data changes
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setRole(profile.role || "");
    }
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfile({ name, role });
      toast.success("Profile updated!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      await saveImage({ storageId });
      toast.success("Profile image updated!");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    }
  }

  async function handleJoinTeam() {
    if (!selectedTeamId) {
      toast.error("Please select a team first");
      return;
    }
    try {
      await joinTeam({ teamId: selectedTeamId });
      toast.success("Successfully joined team!");
    } catch (error) {
      toast.error("Failed to join team");
      console.error(error);
    }
  }

  if (profile === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Profile</h2>
        <SignOutButton />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Profile Image</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
        >
          Save Profile
        </button>
      </form>

      <div className="mt-8">
        {userTeam ? (
          <div className="text-center">
            {isCaptain ? (
              <p className="text-indigo-600 font-medium">
                You are teamcaptain of team "{userTeam.name}"
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-indigo-600 font-medium">
                  You are a member of team "{userTeam.name}"
                </p>
                <button
                  onClick={() => leaveTeam({ teamId: userTeam._id })}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Leave Team
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Available Teams</h3>
              {teams.map((team) => (
                <div key={team._id} className="flex items-center space-x-3 p-3 border rounded">
                  <input
                    type="radio"
                    name="team"
                    id={team._id}
                    checked={selectedTeamId === team._id}
                    onChange={() => setSelectedTeamId(team._id)}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <label htmlFor={team._id} className="flex-grow">
                    <div className="font-medium">{team.name}</div>
                    <div className="text-sm text-gray-500">{team.description}</div>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handleJoinTeam}
                disabled={!selectedTeamId}
                className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                Join Selected Team
              </button>
              <button
                onClick={() => window.location.hash = '#createteam'}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Make a Team →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
