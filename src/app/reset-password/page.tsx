import ResetPasswordClient from "./ResetPasswordClient";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token =
    typeof searchParams.token === "string" ? searchParams.token : "";

  return <ResetPasswordClient token={token} />;
}