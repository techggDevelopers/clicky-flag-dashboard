
import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuthStore();
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("Verifying your email...");
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (!token) {
          setVerificationStatus('error');
          setMessage("Verification token is missing. Please check your email link.");
          return;
        }
        
        const responseMessage = await verifyEmail(token);
        setVerificationStatus('success');
        setMessage(responseMessage);
        toast.success("Email verified successfully!");
      } catch (error: any) {
        setVerificationStatus('error');
        setMessage(error.message || "Failed to verify email. The link may be expired or invalid.");
        toast.error(error.message || "Verification failed");
      }
    };
    
    verifyUserEmail();
  }, [location.search, verifyEmail]);
  
  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      const { resendVerification } = useAuthStore.getState();
      await resendVerification(email);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification email");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <motion.div 
        className="flex-1 max-w-md w-full mx-auto py-16 px-4 sm:px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header 
          title="Admin" 
          description="Email Verification"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="mt-8 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">Email Verification</CardTitle>
              <CardDescription className="text-muted-foreground">
                {verificationStatus === 'loading' ? 'Processing your verification' : 
                  verificationStatus === 'success' ? 'Your email has been verified' : 
                  'There was a problem with verification'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center">
              <div className="flex flex-col items-center space-y-4">
                {verificationStatus === 'loading' && (
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
                )}
                
                {verificationStatus === 'success' && (
                  <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                    <Check className="h-8 w-8" />
                  </div>
                )}
                
                {verificationStatus === 'error' && (
                  <div className="h-14 w-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                )}
                
                <p className="text-lg font-medium">{message}</p>
                
                {verificationStatus === 'error' && (
                  <div className="w-full space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Need a new verification link? Enter your email below:
                    </p>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button 
                      onClick={handleResendVerification}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center">
              {verificationStatus === 'success' ? (
                <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  <Link to="/login">
                    Proceed to Login
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/">
                    Back to Home
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
