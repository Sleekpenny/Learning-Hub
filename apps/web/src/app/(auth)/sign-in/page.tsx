import LoginPanel from "@/components/auth/panels/login-panel";
import { PageSpinner } from "@/components/ui/state-message";
import { GuestOnly } from "@/guards/route-guards";
import { Suspense } from "react";

const SignIn = () => {
    return (
    <Suspense fallback={<PageSpinner />}>
      <GuestOnly>
        <LoginPanel />
      </GuestOnly>
    </Suspense>
  );
}

export default SignIn;