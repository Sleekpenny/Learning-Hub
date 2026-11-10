import { api } from "@/lib/api";
import { toFailure } from "@/lib/utils";
import { ActionResult, LoginPortal, Role, SignInFormData, SignUpFormData, User } from "@/types/global";

export async function loginAction( formData: SignInFormData, portal: LoginPortal): Promise<ActionResult<User>> {
  try {
    const { user } = await api<{ user: User }>("/auth/login", {
      method: "POST",
      body: formData,
      headers: { "X-Login-Portal": portal },
      skipRefresh: true,
    });

    const expected: Role = portal === "admin" ? "ADMIN" : "LEARNER";
    if (user.role !== expected) {
      await logoutAction();
      return { 
        success: false, 
        code: "WRONG_PORTAL", 
        message: "This account cannot sign in here.", 
       };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error(error);
    return toFailure(error);   
  }
}

export async function signupAction(formData: SignUpFormData): Promise<ActionResult<User>> {
  try {
    const { user } = await api<{ user: User }>("/auth/signup", {
      method: "POST",
      body: formData,
      skipRefresh: true,
    });
    return { success: true, data: user };
  } catch (error) {
     return toFailure(error);      
  }
}

export async function logoutAction(): Promise<ActionResult<null>> {
  try {
    await api<void>("/auth/logout", { method: "POST", skipRefresh: true });
    return { success: true, data: null };
  } catch (error) {
    return toFailure(error);
  }
}