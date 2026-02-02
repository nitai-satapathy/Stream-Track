import { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupPage() {
  return <SignupForm />;
}
