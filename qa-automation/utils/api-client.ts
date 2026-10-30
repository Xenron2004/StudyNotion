export const API_BASE_URL =
  process.env.API_BASE_URL ?? "https://jsonplaceholder.typicode.com";
export const API_RESPONSE_TIME_LIMIT_MS = Number(
  process.env.API_RESPONSE_TIME_LIMIT_MS ?? 10_000,
);

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};
