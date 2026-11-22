import type { Metadata } from "next";
import LoginForm from "@/src/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Acceso",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="grid flex-1 place-items-center px-4 py-10">
      <LoginForm />
    </main>
  );
}
