import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const productInput = {
  title: z.string(),
  price: z.string(),
  content: z.string().optional(),
};

const productGenerated = {
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
};

const createProductSchema = z.object({
  ...productInput,
});

const productReplySchema = z.object({
  ...productInput,
  ...productGenerated,
});

const productsReplySchema = z.array(productReplySchema);

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const { schemas: productSchemas, $ref } = buildJsonSchemas({
  createProductSchema,
  productReplySchema,
  productsReplySchema,
});