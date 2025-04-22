import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import { Profile } from "./Profile";
import { Teams } from "./Teams";
import { TeamsList } from "./TeamsList";
import { CreateTeam } from "./CreateTeam";

export default function App() {
  const [page, setPage] = useState("home");

  // Handle hash-based routing
  useState(() => {
    const handleHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash) setPage(hash);
    };
    window.addEventListener('hashchange', handleHash);
    handleHash(); // Handle initial hash
    return () => window.removeEventListener('hashchange', handleHash);
  });

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
  switch (page) {
    case "profile":
      return <Profile />;
    case "teams":
      return <Teams />;
    case "teamslist":
      return <TeamsList />;
    case "createteam":
      return <CreateTeam />;
    default:
      return (
        <div className="text-center">
          <h1 className="text-5xl font-bold accent-text mb-4">Welcome to Hackathon Hub</h1>
          <p className="text-xl text-slate-600">
            Get ready for an amazing hackathon experience. Update your profile, join a team,
            and start collaborating with fellow hackers!
          </p>
          <Unauthenticated>
            <SignInForm />
          </Unauthenticated>
        </div>
      );
  }
}
