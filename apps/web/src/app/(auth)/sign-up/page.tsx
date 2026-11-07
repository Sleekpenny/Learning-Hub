import RegisterPanel from "@/components/auth/panels/register-panel";
import { PageSpinner } from "@/components/ui/state-message";
import { GuestOnly } from "@/guards/route-guards";
import { Suspense } from "react";

const SignUp = () => {
    return (
        <Suspense fallback={<PageSpinner />}>
      <GuestOnly>
        <RegisterPanel />
      </GuestOnly>
    </Suspense>
  );
    
}

export default SignUp;