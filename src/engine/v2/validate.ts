import { storySchema, type V2Story } from "./schema";

export type StoryValidation =
  | { success: true; data: V2Story }
  | { success: false; errors: string[] };

export const validateV2Story = (input: unknown): StoryValidation => {
  const result = storySchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  return {
    success: false,
    errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  };
};
