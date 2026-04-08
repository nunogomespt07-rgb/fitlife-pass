import { redirect } from "next/navigation";

/** Auth por e-mail vive em `/auth/email`. Mantém esta rota como alias. */
export default function AuthPage() {
  redirect("/auth/email");
}
