import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { Profile } from "./Profile";
import { Teams } from "./Teams";
import { TeamsList } from "./TeamsList";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">Hackathon Hub</h2>
        <nav className="flex gap-4 items-center">
          <Authenticated>
            <button 
              onClick={() => setPage("home")}
              className="hover:text-indigo-600"
            >
              Home
            </button>
            <button 
              onClick={() => setPage("profile")}
              className="hover:text-indigo-600"
            >
              Profile
            </button>
            <button 
              onClick={() => setPage("teams")}
              className="hover:text-indigo-600"
            >
              My Team
            </button>
            <button 
              onClick={() => setPage("teamslist")}
              className="hover:text-indigo-600"
            >
              All Teams
            </button>
          </Authenticated>
          <SignOutButton />
        </nav>
      </header>
      <main className="flex-1 p-8">
        <div className="w-full max-w-4xl mx-auto">
          <Content page={page} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content({ page }: { page: string }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold accent-text mb-4">Welcome to Hackathon Hub</h1>
          <p className="text-xl text-slate-600 mb-4">
            Join us for an exciting weekend of innovation, collaboration, and coding!
            Create or join a team, showcase your skills, and compete for amazing prizes.
          </p>
          <SignInForm />
        </div>
      </div>
    );
  }

  switch (page) {
    case "profile":
      return <Profile />;
    case "teams":
      return <Teams />;
    case "teamslist":
      return <TeamsList />;
    default:
      return (
        <div className="text-center">
          <h1 className="text-5xl font-bold accent-text mb-4">Welcome back!</h1>
          <p className="text-xl text-slate-600">
            Get ready for an amazing hackathon experience. Update your profile, join a team,
            and start collaborating with fellow hackers!
          </p>
        </div>
      );
  }
}
