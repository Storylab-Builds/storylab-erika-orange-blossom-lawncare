import { z } from 'zod';
import { ApiError } from './http';

/** Validate `data` against `schema`, throwing a 400 ApiError on failure.
 *  Returns the schema's OUTPUT type (zod defaults applied). */
export function parse<S extends z.ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(400, 'Validation failed', result.error.flatten());
  }
  return result.data;
}
