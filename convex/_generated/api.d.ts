/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as ai_mutations from "../ai_mutations.js";
import type * as crons from "../crons.js";
import type * as dreams from "../dreams.js";
import type * as insights from "../insights.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_models from "../lib/models.js";
import type * as lib_prompts from "../lib/prompts.js";
import type * as subscriptions from "../subscriptions.js";
import type * as synthesis from "../synthesis.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  ai_mutations: typeof ai_mutations;
  crons: typeof crons;
  dreams: typeof dreams;
  insights: typeof insights;
  "lib/constants": typeof lib_constants;
  "lib/models": typeof lib_models;
  "lib/prompts": typeof lib_prompts;
  subscriptions: typeof subscriptions;
  synthesis: typeof synthesis;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
