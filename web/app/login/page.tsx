import { redirect } from "next/navigation";

/**
 * Canonical auth is the homepage (/). Redirect /login to / so there is only one public login experience.
 */
export default function LoginPage() {
  redirect("/");
}
