import { Header } from "@/components/Header";
import { HomeClient } from "@/components/home/HomeClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Place } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("places").select("*");

  const places = (data ?? []) as unknown as Place[];

  return (
    <>
      <Header active="/home" />
      <HomeClient places={places} />
    </>
  );
}
