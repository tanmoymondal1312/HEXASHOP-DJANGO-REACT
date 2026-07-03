import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * On-demand revalidation for the hero slides. The staff studio calls this after
 * saving/creating/deleting/reordering a slide so the storefront home page
 * updates immediately instead of waiting out the 60s ISR window.
 *
 * Non-destructive: it only refreshes the cached hero content + home page, takes
 * no parameters, so there's nothing to abuse beyond forcing a cache refresh.
 */
export async function POST() {
  revalidateTag("hero-slides");
  revalidatePath("/");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
