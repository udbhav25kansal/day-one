import { SCENARIO } from "@/lib/scenario";
import Workspace from "@/components/Workspace";

export default async function SimPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sessionId } = await params;
  const sp = await searchParams;
  const demo = sp.demo === "1";
  return <Workspace sessionId={sessionId} brief={SCENARIO.brief} demo={demo} />;
}
