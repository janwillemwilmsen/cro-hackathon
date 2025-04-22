import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  teams: defineTable({
    name: v.string(),
    description: v.string(),
    captainId: v.id("users"),
    members: v.array(v.id("users")),
    votes: v.number(),
  })
    .index("by_members", ["members"]),
  teamComments: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    content: v.string(),
  }).index("by_team", ["teamId"]),
 // In schema.ts, temporarily allow both fields:
profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    role: v.string(),
    image: v.optional(v.string()),
    imageId: v.optional(v.string()), // Add this temporarily
}).index("by_userId", ["userId"]),

};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
