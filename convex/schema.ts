import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    role: v.string(),
    imageId: v.optional(v.id("_storage")),
  }).index("by_user", ["userId"]),

  teams: defineTable({
    name: v.string(),
    description: v.string(),
    captainId: v.id("users"),
    members: v.array(v.id("users")),
    votes: v.number(),
  }).index("by_votes", ["votes"]),

  teamComments: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    content: v.string(),
  }).index("by_team", ["teamId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
