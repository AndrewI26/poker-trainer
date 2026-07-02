import { client } from "@poker-trainer/api-sdk";

client.setConfig({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000",
});
