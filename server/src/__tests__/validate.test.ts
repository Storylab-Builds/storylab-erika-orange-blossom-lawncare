// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parse } from '../lib/validate';
import { ApiError } from '../lib/http';

const schema = z.object({
  name: z.string().min(1),
  age: z.number().int().nonnegative(),
});

describe('parse', () => {
  it('returns the validated data on valid input', () => {
    const result = parse(schema, { name: 'Ada', age: 30 });
    expect(result).toEqual({ name: 'Ada', age: 30 });
  });

  it('applies zod defaults to the returned output', () => {
    const withDefault = z.object({ role: z.string().default('CREW') });
    const result = parse(withDefault, {});
    expect(result.role).toBe('CREW');
  });

  it('throws ApiError(400) on invalid input', () => {
    let thrown: unknown;
    try {
      parse(schema, { name: '', age: -5 });
    } catch (err) {
      thrown = err;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).status).toBe(400);
  });

  it('includes the flattened zod error in ApiError.details', () => {
    let thrown: ApiError | undefined;
    try {
      parse(schema, { name: 123, age: 'oops' });
    } catch (err) {
      thrown = err as ApiError;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    expect(thrown?.details).toBeTruthy();
    // flatten() yields a fieldErrors object.
    expect(thrown?.details).toHaveProperty('fieldErrors');
  });
});
