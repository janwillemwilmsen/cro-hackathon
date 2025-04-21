import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useToast } from "../hooks/use-toast";

export function TeamPage({ teamId }: { teamId: Id<"teams"> }) {
  const team = useQuery(api.teams.getTeam, { teamId });
  const updates = useQuery(api.teams.listUpdates, { teamId });
  const addUpdate = useMutation(api.teams.addUpdate);
  const generateUploadUrl = useMutation(api.teams.generateTeamImageUrl);
  const updateTeamImage = useMutation(api.teams.updateTeamImage);
  const { toast } = useToast();

  const [newUpdate, setNewUpdate] = useState("");
  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  if (!team) return <div>Loading...</div>;

  const isCaptain = team.members.some(
    member => member.role === "Captain"
  );

  async function handleImageUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedImage) return;

    try {
      // Step 1: Get a short-lived upload URL
      const postUrl = await generateUploadUrl();

      // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      const json = await result.json();
      if (!result.ok) {
        throw new Error(`Upload failed: ${JSON.stringify(json)}`);
      }
      const { storageId } = json;

      // Step 3: Save the storage ID to the team
      await updateTeamImage({ teamId, storageId });
      
      setSelectedImage(null);
      if (imageInput.current) imageInput.current.value = "";
      
      toast({
        title: "Success",
        description: "Team image updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team image",
        variant: "destructive",
      });
    }
  }

  async function handleAddUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (!newUpdate.trim()) return;

    try {
      await addUpdate({
        teamId,
        content: newUpdate,
        type: "update",
      });
      setNewUpdate("");
      toast({
        title: "Success",
        description: "Update posted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post update",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{team.description}</p>
          </div>
          {team.imageUrl && (
            <img
              src={team.imageUrl}
              alt={team.name}
              className="h-24 w-24 object-cover rounded-lg"
            />
          )}
        </div>

        {isCaptain && (
          <form onSubmit={handleImageUpload} className="mt-4">
            <input
              type="file"
              accept="image/*"
              ref={imageInput}
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              type="submit"
              disabled={!selectedImage}
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
            >
              Upload Team Image
            </button>
          </form>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
          <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {team.members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center space-x-3 text-gray-500"
              >
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt={member.email}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.email}
                  </p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900">Team Updates</h3>
        
        <form onSubmit={handleAddUpdate} className="mt-4">
          <textarea
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            placeholder="Share an update with your team..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
          <button
            type="submit"
            disabled={!newUpdate.trim()}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
          >
            Post Update
          </button>
        </form>

        <div className="mt-6 space-y-4">
          {updates?.map((update) => (
            <div key={update._id} className="flex space-x-3">
              {update.authorImage ? (
                <img
                  src={update.authorImage}
                  alt={update.authorName}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200" />
              )}
              <div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {update.authorName}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  {update.content}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {new Date(update._creationTime).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
