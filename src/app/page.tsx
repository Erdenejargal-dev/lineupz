import { Button } from "@/components/ui/button";
import SplitText from "@/components/ui/split-text";
import QuickJoinForm from '@/components/QuickJoinForm'; // Changed this line
import Header from "@/components/header"
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <div className="mb-8">
          <SplitText className="text-5xl tracking-tighter font-medium">
            Let's line up
          </SplitText>
          <SplitText className="tracking-tight text-xl">
            Save your time.
          </SplitText>
        </div>
        <QuickJoinForm />
        <div className="mt-4">
            <Link 
          href="/dashboard" 
          className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
        >
          Click here to create a lining
        </Link>
        </div>
      </main>
      <footer className="flex justify-center py-4">
       
      </footer>
    </div>
  );
}