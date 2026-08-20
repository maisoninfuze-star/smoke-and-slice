import { AuthForm } from "@/components/AuthForm";
export const metadata = { title: "Connexion" };
export default function LoginPage() {
  return <AuthForm mode="login" />;
}
