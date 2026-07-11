import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: Parameters<typeof updateSession>[0]) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js)$).*)",
  ],
};
