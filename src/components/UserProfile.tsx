{`import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Profile = {
  _id?: string;
  userId: string;
  title?: string;
  bio?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  imageUrl?: string;
};

export default function UserProfile() {
  const profile = useQuery(api.profiles.getProfile) as Profile | null;
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [skillInput, setSkillInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const updateProfile = useMutation(api.profiles.updateProfile);
  const updateProfileImage = useMutation(api.profiles.updateProfileImage);
  const generateUploadUrl = useMutation(api.teams.generateTeamImageUrl);

  useEffect(() => {
    if (profile) {
      setTitle(profile.title || "");
      setBio(profile.bio || "");
      setSkills(profile.skills || []);
      setGithub(profile.github || "");
      setLinkedin(profile.linkedin || "");
      setImageUrl(profile.imageUrl);
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      await updateProfile({
        title,
        bio,
        skills,
        github,
        linkedin,
      });
      setMessage("Profile saved!");
    } catch (e: any) {
      setMessage(e.message || "Failed to save profile.");
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const json = await result.json();
    if (!result.ok) {
      setMessage("Image upload failed");
      return;
    }
    const { storageId } = json;
    // Get a signed URL for the image
    const url = postUrl.replace("/upload", `/storage/${storageId}`);
    await updateProfileImage({ imageUrl: url });
    setImageUrl(url);
    setMessage("Profile image updated!");
  }

  function handleAddSkill() {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput("");
    }
  }

  function handleRemoveSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Your Profile</h2>
      {message && <div className="mb-2 text-green-600">{message}</div>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-medium">Profile Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Profile"
              className="mt-2 rounded-full"
              width={80}
              height={80}
            />
          )}
        </div>
        <div>
          <label className="block font-medium">Title</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Developer"
          />
        </div>
        <div>
          <label className="block font-medium">Bio</label>
          <textarea
            className="border rounded px-2 py-1 w-full"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
          />
        </div>
        <div>
          <label className="block font-medium">Skills</label>
          <div className="flex gap-2 mb-2">
            <input
              className="border rounded px-2 py-1 flex-1"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add a skill"
            />
            <button
              type="button"
              className="bg-blue-500 text-white px-2 rounded"
              onClick={handleAddSkill}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-gray-200 px-2 py-1 rounded flex items-center"
              >
                {skill}
                <button
                  type="button"
                  className="ml-1 text-red-500"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium">GitHub</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="GitHub username or URL"
          />
        </div>
        <div>
          <label className="block font-medium">LinkedIn</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="LinkedIn profile URL"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
`}
