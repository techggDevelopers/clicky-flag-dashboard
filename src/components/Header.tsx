
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  description?: string;
}

const Header = ({ title, description }: HeaderProps) => {
  return (
    <motion.header 
      className="text-center mb-16 px-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.h1 
        className="text-4xl md:text-5xl font-medium tracking-tight mb-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        {title}
      </motion.h1>
      
      {description && (
        <motion.p 
          className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto text-balance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          {description}
        </motion.p>
      )}
    </motion.header>
  );
};

export default Header;
