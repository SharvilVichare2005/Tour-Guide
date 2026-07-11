import { Header } from "@/components/Header";
import { ExploreClient } from "@/components/explore/ExploreClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Destination } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("destinations").select("*");

  const destinations = (data ?? []) as unknown as Destination[];

  return (
    <>
      <Header active="/explore" />
      <ExploreClient destinations={destinations} />
    </>
  );
}
