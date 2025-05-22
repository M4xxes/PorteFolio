import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Github, Linkedin, Mail } from 'lucide-react';

const Contact = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section ref={ref} id="contact" className="py-20 px-4 md:px-20 bg-[#111111]">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-2xl font-mono text-blue-500 mb-12"
        >
          Contact
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h3 className="text-3xl font-bold mb-6">Travaillons ensemble</h3>
          <p className="text-gray-400 mb-8">
            Je suis ouvert aux opportunités de collaboration. N'hésitez pas à me contacter
            pour discuter de vos projets.
          </p>

          <div className="flex justify-center gap-8 mb-12">
            <a
              href="https://github.com/M4xxes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Github size={28} />
            </a>
            <a
              href="https://www.linkedin.com/in/maxime-pero-b320a3356/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Linkedin size={28} />
            </a>
            <a
              href="mailto:maximepero12@gmail.com"
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Mail size={28} />
            </a>
          </div>

          <a
            href="mailto:maximepero12@gmail.com"
            className="inline-block px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors duration-300"
          >
            Envoyer un email
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact