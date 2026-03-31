import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
export {
  STORAGE_BUCKETS,
  deleteFromStorage,
  downloadFromStorage,
  getPublicUrl,
  getStorageAccessUrl,
  getStorageBackendName,
  isGcpStorageConfigured,
  serverStorageSupabase as storageSupabaseAdmin,
  storeFileBuffer,
} from "@/lib/server-storage";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin Supabase client for server operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Get the current user from Clerk and sync to Supabase
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Get user details from Clerk
  const clerkAuth = await auth();
  
  // Check if user exists in Supabase
  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching user from Supabase:", fetchError);
    return null;
  }

  // If user doesn't exist, create profile
  if (!existingUser) {
    const { data: newUser, error: createError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email: clerkAuth.sessionClaims?.email || "",
        full_name: clerkAuth.sessionClaims?.full_name || "",
        avatar_url: clerkAuth.sessionClaims?.image_url || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating user profile:", createError);
      return null;
    }

    return newUser;
  }

  return existingUser;
}
