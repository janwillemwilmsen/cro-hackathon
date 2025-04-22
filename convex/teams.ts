import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Create the team
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      captainId: userId,
      members: [userId],
      votes: 0,
    });

    return teamId;
  },
});

export const list = query({
  args: {},
  async handler(ctx) {
    return await ctx.db
      .query("teams")
      .order("desc")
      .collect();
  },
});

export const myTeams = query({
  args: {},
  async handler(ctx) {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("members"), [userId]))
      .collect();
  },
});

export const joinTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is already in a team
    const currentTeams = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("members"), [userId]))
      .collect();

    if (currentTeams.length > 0) {
      throw new Error("You must leave your current team before joining another");
    }

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    // Join the team
    await ctx.db.patch(args.teamId, {
      members: [userId],
    });
  },
});

export const leaveTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    if (team.captainId === userId) {
      throw new Error("Team captain cannot leave the team");
    }

    // Leave the team
    await ctx.db.patch(args.teamId, {
      members: [],
    });
  },
});

export const getTeamMembers = query({
  args: {
    teamId: v.id("teams"),
  },
  async handler(ctx, args) {
    const team = await ctx.db.get(args.teamId);
    if (!team) return [];

    const memberProfiles = await Promise.all(
      team.members.map(async (userId) => {
        const profile = await ctx.db
          .query("profiles")
          .filter((q) => q.eq(q.field("userId"), userId))
          .unique();
        return { userId, profile };
      })
    );

    return memberProfiles;
  },
});

export const addComment = mutation({
  args: {
    teamId: v.id("teams"),
    content: v.string(),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is a member of the team
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");
    
    if (!team.members.includes(userId)) {
      throw new Error("Only team members can comment");
    }

    return await ctx.db.insert("teamComments", {
      teamId: args.teamId,
      userId,
      content: args.content,
    });
  },
});

export const getComments = query({
  args: {
    teamId: v.id("teams"),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check if user is a member of the team
    const team = await ctx.db.get(args.teamId);
    if (!team || !team.members.includes(userId)) {
      return [];
    }

    return await ctx.db
      .query("teamComments")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .collect();
  },
});

export const vote = mutation({
  args: {
    teamId: v.id("teams"),
  },
  async handler(ctx, args) {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    // Increment the votes
    await ctx.db.patch(args.teamId, {
      votes: (team.votes || 0) + 1,
    });
  },
});
