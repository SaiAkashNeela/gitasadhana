export type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  ts: number;
};
