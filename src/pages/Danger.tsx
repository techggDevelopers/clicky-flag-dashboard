import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, LogOut } from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/authStore";

const Danger = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    useEffect(() => {
        // Show a warning toast when the page loads
        toast.warning("Danger mode activated. System shutdown initiated.", {
            duration: 5000,
        });
    }, []);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <motion.div
                className="flex-1 max-w-md w-full mx-auto py-16 px-4 sm:px-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Header
                    title="Danger Mode Activated"
                    description="System shutdown in progress..."
                />

                <motion.div
                    className="mt-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="flex justify-center mb-6">
                        <AlertTriangle className="h-16 w-16 text-red-500" />
                    </div>

                    <p className="text-muted-foreground mb-8">
                        The system is shutting down. Please wait for the process to complete.
                    </p>

                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Emergency Logout
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Danger; 