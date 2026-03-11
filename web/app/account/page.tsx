import { redirect } from "next/navigation";

/**
 * /account – user account/dashboard.
 * Redirects to dashboard for now so existing dashboard routes stay unchanged.
 */
export default function AccountPage() {
  redirect("/dashboard");
}
