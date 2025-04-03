import { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import FlagToggle from "@/components/FlagToggle";
import { useFlagStore } from "@/lib/flagStore";

const Index = () => {
  const { initFlags, flags: flagStates, flagDetails } = useFlagStore();

  useEffect(() => {
    initFlags();
  }, [initFlags]);

  // Calculate active flags for summary
  const activeFlags = Object.entries(flagStates)
    .filter(([_, isActive]) => isActive)
    .map(([name]) => name);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <motion.div
        className="flex-1 max-w-3xl w-full mx-auto py-16 px-4 sm:px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header
          title="Dashboard"
          description="Toggle system features on or off. Only one flag can be active at a time."
        />

        <div className="mt-8">
          {flagDetails.length > 0 ? (
            flagDetails.map((flag, index) => (
              <FlagToggle
                key={flag._id}
                name={flag.name}
                label={flag.label}
                description={flag.description}
                index={index}
              />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Loading flags...
            </div>
          )}
        </div>

        <motion.div
          className="mt-12 rounded-xl p-6 text-center bg-card border shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-medium mb-2 text-card-foreground">Status Summary</h3>
          <p className="text-muted-foreground mb-4">
            {activeFlags.length === 0
              ? "No flags are currently active"
              : `Active flag: ${activeFlags[0]}`
            }
          </p>

          <div className="flex justify-center gap-2">
            {Object.entries(flagStates).map(([name, isActive]) => (
              <div
                key={name}
                className={`
                  w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium transition-all
                  ${isActive
                    ? name === 'F1'
                      ? 'bg-red-500 text-white dark:bg-red-600'
                      : name === 'F2'
                        ? 'bg-green-500 text-white dark:bg-green-600'
                        : 'bg-blue-500 text-white dark:bg-blue-600'
                    : 'bg-secondary text-secondary-foreground dark:bg-secondary/80'}
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
