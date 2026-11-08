"use client";
import SignUpForm from "../signup-form";

const RegisterPanel = ()=> {
  return (
    <div className="w-full max-w-md">
      <h1 className="text-xl font-bold tracking-tight">Register as a Leaner in LearnHub</h1>
    <SignUpForm />     
    </div>
  );
}

export default RegisterPanel;