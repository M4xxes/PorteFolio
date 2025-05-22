import { motion } from 'framer-motion';

const Hero = () => {
  const letterAnimation = {
    initial: { y: 50, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: i * 0.1,
      },
    }),
  };

  const name = "Maxime Pero".split("");

  return (
    <section className="min-h-screen flex flex-col justify-center px-4 md:px-20 py-20 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-gradient-x" />
      
      <div className="max-w-5xl relative">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-blue-400 font-mono mb-4 relative"
        >
          <span className="absolute -left-8 top-0 text-blue-500 animate-pulse">&gt;</span>
          Bonjour, je suis
        </motion.p>
        
        <div className="overflow-hidden">
          <div className="flex">
            {name.map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterAnimation}
                initial="initial"
                animate="animate"
                className="text-5xl md:text-7xl font-bold inline-block"
                style={{
                  background: "linear-gradient(to right, #fff, #60A5FA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </div>
        </div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold text-gray-300 mb-8 mt-4"
        >
          Je crée des applications web modernes.
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12"
        >
          Développeur FrontEnd spécialisé dans la création d'applications web modernes.
          Je transforme des idées en solutions digitales innovantes.
        </motion.p>
        
        <motion.a
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          href="#contact"
          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md font-medium transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
        >
          Me contacter
        </motion.a>
      </div>

      {/* Animated scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-blue-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-blue-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;