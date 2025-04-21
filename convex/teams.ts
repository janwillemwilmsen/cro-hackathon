import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      captainId: userId,
      members: [userId],
      votes: 0,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("teams")
      .withIndex("by_votes")
      .order("desc")
      .collect();
  },
});

export const myTeams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const teams = await ctx.db.query("teams").collect();
    return teams.filter(team => team.members.includes(userId));
  },
});

export const joinTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    if (team.members.includes(userId)) {
      throw new Error("Already a member of this team");
    }

    await ctx.db.patch(args.teamId, {
      members: [...team.members, userId],
    });
  },
});

export const leaveTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    if (team.captainId === userId) {
      throw new Error("Team captain cannot leave the team");
    }

    if (!team.members.includes(userId)) {
      throw new Error("Not a member of this team");
    }

    await ctx.db.patch(args.teamId, {
      members: team.members.filter(id => id !== userId),
    });
  },
});

export const vote = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    await ctx.db.patch(args.teamId, {
      votes: (team.votes || 0) + 1,
    });
  },
});

export const addComment = mutation({
  args: {
    teamId: v.id("teams"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    if (!team.members.includes(userId)) {
      throw new Error("Only team members can comment");
    }

    await ctx.db.insert("teamComments", {
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
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const team = await ctx.db.get(args.teamId);
    if (!team) return [];

    // Only show comments to team members
    if (!team.members.includes(userId)) {
      return [];
    }

    return await ctx.db
      .query("teamComments")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("asc")
      .collect();
  },
});

export const getTeamMembers = query({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return [];

    const memberProfiles = await Promise.all(
      team.members.map(async (userId) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();
        return { userId, profile };
      })
    );

    return memberProfiles;
  },
});
