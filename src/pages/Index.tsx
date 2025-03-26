
import { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import FlagToggle from "@/components/FlagToggle";
import { useFlagStore } from "@/lib/flagStore";

const flags = [
  { 
    name: "F1", 
    label: "Analytics", 
    description: "Enable data collection and performance analytics" 
  },
  { 
    name: "F2", 
    label: "Dark Mode", 
    description: "Enable dark mode appearance throughout the app" 
  },
  { 
    name: "F3", 
    label: "Notifications", 
    description: "Enable push and email notifications for new events" 
  },
  { 
    name: "F4", 
    label: "Beta Features", 
    description: "Access experimental features before public release" 
  }
];

const Index = () => {
  const { initFlags, flags: flagStates } = useFlagStore();
  
  useEffect(() => {
    initFlags();
  }, [initFlags]);
  
  // Calculate active flags for summary
  const activeFlags = Object.entries(flagStates)
    .filter(([_, isActive]) => isActive)
    .map(([name]) => name);
  
  return (
    <div className="min-h-screen flex flex-col">
      <motion.div 
        className="flex-1 max-w-3xl w-full mx-auto py-16 px-4 sm:px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header 
          title="Feature Flags" 
          description="Toggle system features on or off. Changes are saved instantly."
        />
        
        <div className="mt-8">
          {flags.map((flag, index) => (
            <FlagToggle 
              key={flag.name}
              name={flag.name}
              label={flag.label}
              description={flag.description}
              index={index}
            />
          ))}
        </div>
        
        <motion.div 
          className="mt-12 glass-effect rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-medium mb-2">Status Summary</h3>
          <p className="text-muted-foreground mb-4">
            {activeFlags.length === 0 
              ? "No flags are currently active" 
              : `Active flags: ${activeFlags.join(', ')}`
            }
          </p>
          
          <div className="flex justify-center gap-2">
            {Object.entries(flagStates).map(([name, isActive]) => (
              <div 
                key={name}
                className={`
                  w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-secondary text-secondary-foreground'}
                `}
              >
                {name}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
