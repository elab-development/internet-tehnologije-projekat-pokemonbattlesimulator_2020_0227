const { createInsertSchema, createSelectSchema } = require("drizzle-zod");
const { messages } = require("../db/schema");
const { z } = require("zod");

const insertMessageSchema = createInsertSchema(messages);
const selectMessageSchema = createSelectSchema(messages);
const updateMessageSchema = insertMessageSchema.optional();

const directionMessageValidation = z.object({direction: z.enum(['both', 'sent', 'received']).optional()});

module.exports = {
    insertMessageSchema,
    selectMessageSchema,
    updateMessageSchema,
    directionMessageValidation
}