import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ChartLine } from "lucide-react";
import { FaGoogle, FaTwitter, FaMicrosoft } from "react-icons/fa";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { loginSchema, insertUserSchema, type LoginUser, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

const registerSchemaExtended = insertUserSchema.extend({
  confirmPassword: loginSchema.shape.password,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = InsertUser & { confirmPassword: string };

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchemaExtended),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLoginSubmit = async (data: LoginUser) => {
    try {
      await loginMutation.mutateAsync(data);
      setShowSuccess(true);
      // Small delay to show success message, then redirect happens automatically
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const onRegisterSubmit = async (data: RegisterForm) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerMutation.mutateAsync(registerData);
      setShowSuccess(true);
      // Small delay to show success message, then redirect happens automatically
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: "Social Login",
      description: `${provider} login would be implemented here`,
      variant: "default",
    });
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-blue-900/20 to-slate-900 animate-gradient"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Branding */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
              <ChartLine className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Should I buy this stock</h1>
            <p className="text-slate-400">Financial intelligence at your fingertips</p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 text-green-400 text-center">
              <ChartLine className="h-5 w-5 inline mr-2" />
              {isRegistering ? "Account created" : "Login"} successful! Redirecting...
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-750 hover:shadow-lg hover:shadow-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              onClick={() => handleSocialLogin("Google")}
            >
              <FaGoogle className="mr-3 h-4 w-4 text-red-400" />
              Continue with Google
            </Button>

            <Button
              type="button"
              className="w-full bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              onClick={() => handleSocialLogin("Twitter")}
            >
              <FaTwitter className="mr-3 h-4 w-4" />
              Continue with Twitter
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-750 hover:shadow-lg hover:shadow-white/10 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              onClick={() => handleSocialLogin("Microsoft")}
            >
              <FaMicrosoft className="mr-3 h-4 w-4 text-blue-400" />
              Continue with Microsoft
            </Button>
          </div>

          {/* OR Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-400">OR</span>
            </div>
          </div>

          {/* Toggle between Login and Register */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-800 p-1 rounded-lg">
              <Button
                type="button"
                variant={!isRegistering ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsRegistering(false)}
                className={!isRegistering ? "bg-green-500 hover:bg-green-600" : "text-slate-400 hover:text-white"}
              >
                Sign In
              </Button>
              <Button
                type="button"
                variant={isRegistering ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsRegistering(true)}
                className={isRegistering ? "bg-green-500 hover:bg-green-600" : "text-slate-400 hover:text-white"}
              >
                Sign Up
              </Button>
            </div>
          </div>

          {/* Login/Register Form */}
          {!isRegistering ? (
            <form className="space-y-6" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </Label>
                <Input
                  {...loginForm.register("email")}
                  type="email"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your email"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    {...loginForm.register("password")}
                    type={showPassword ? "text" : "password"}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-green-500 focus:border-green-500 pr-12"
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" />
                  <Label htmlFor="remember-me" className="text-sm text-slate-300">
                    Remember me
                  </Label>
                </div>
                <Button type="button" variant="link" className="text-green-500 hover:text-green-400 p-0">
                  Forgot your password?
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:shadow-lg hover:shadow-green-500/25"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign in to your account"
                )}
              </Button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </Label>
                  <Input
                    {...registerForm.register("firstName")}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-green-500 focus:border-green-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name
                  </Label>
                  <Input
                    {...registerForm.register("lastName")}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-green-500 focus:border-green-500"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </Label>
                <Input
                  {...registerForm.register("email")}
                  type="email"
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your email"
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </Label>
                <Input
                  {...registerForm.register("password")}
                  type={showPassword ? "text" : "password"}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-green-500 focus:border-green-500"
                  placeholder="Create a password"
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </Label>
                <Input
                  {...registerForm.register("confirmPassword")}
                  type={showPassword ? "text" : "password"}
                  className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:ring-green-500 focus:border-green-500"
                  placeholder="Confirm your password"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:shadow-lg hover:shadow-green-500/25"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating account...
                  </>
                ) : (
                  "Create your account"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
