"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import LoginForm from "../login-form";
import { LoginPortal } from "@/types/global";


const LoginPanel = ()=> {
  const params = useSearchParams();
  const [portal, setPortal] = useState<LoginPortal>(params.get("portal") === "admin" ? "admin" : "learner");
 // const next = params.get("next");

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Login to your account</h1>

      <Tabs value={portal} onValueChange={(value) => setPortal(value as LoginPortal)} className="mt-6">
        <TabsList aria-label="Choose how you sign in">
          <TabsTrigger value="learner">Learner</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="learner" className="mt-2">
          <p className="mb-5 text-sm text-muted-foreground">Welcome back. Continue learning where you left off.</p>
          <LoginForm portal="learner" />
        </TabsContent>

        <TabsContent value="admin" className="mt-2">
          <p className="mb-5 text-sm text-muted-foreground">
            For administrators only. Learner accounts cannot sign in here.
          </p>
          <LoginForm portal="admin" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LoginPanel;