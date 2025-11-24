// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
import ResetPasswordClient from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await the promise
  const params = await searchParams;

  // Then safely extract the token
  const token = typeof params.token === "string" ? params.token : "";

  return <ResetPasswordClient token={token} />;
}
