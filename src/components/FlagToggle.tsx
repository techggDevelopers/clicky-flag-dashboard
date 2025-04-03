import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCcw, HeadphonesIcon } from "lucide-react";
import { useFlagStore } from "@/lib/flagStore";

interface FlagToggleProps {
  name: string;
  label: string;
  description: string;
  index: number;
}

const FlagToggle = ({ name, label, description, index }: FlagToggleProps) => {
  const { flags, toggleFlag } = useFlagStore();
  const isActive = flags[name];

  const getIcon = (flagName: string) => {
    switch (flagName) {
      case 'F1':
        return <AlertTriangle className={`h-5 w-5 ${isActive ? 'text-red-500' : 'text-muted-foreground'}`} />;
      case 'F2':
        return <RefreshCcw className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-muted-foreground'}`} />;
      case 'F3':
        return <HeadphonesIcon className={`h-5 w-5 ${isActive ? 'text-blue-500' : 'text-muted-foreground'}`} />;
      default:
        return null;
    }
  };

  const handleToggle = async () => {
    await toggleFlag(name);
  };

  return (
    <motion.div
      className="relative mb-6 last:mb-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.1 + (index * 0.1),
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <motion.div
        className={`
          p-6 rounded-xl border transition-all duration-300 shadow-sm
          ${isActive
            ? name === 'F1'
              ? 'border-red-500/30 bg-red-500/5'
              : name === 'F2'
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-blue-500/30 bg-blue-500/5'
            : 'border-border bg-card hover:bg-secondary/50'}
        `}
        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        onClick={handleToggle}
        layout
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
              >
                {getIcon(name)}
              </motion.div>

              <h3 className="text-lg font-medium">{label}</h3>

              <div className="text-xs px-2 py-0.5 rounded-full font-medium ml-1 bg-secondary text-secondary-foreground">
                {name}
              </div>
            </div>

            <p className="text-muted-foreground text-sm">{description}</p>
          </div>

          <div className="relative">
            <div
              className={`
                w-12 h-7 rounded-full transition-colors duration-300 cursor-pointer
                ${isActive
                  ? name === 'F1'
                    ? 'bg-red-500'
                    : name === 'F2'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  : 'bg-secondary'}
              `}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  className={`
                    absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-sm
                  `}
                  initial={{ x: isActive ? 0 : 0 }}
                  animate={{ x: isActive ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FlagToggle;
