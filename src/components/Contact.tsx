import React from 'react';
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

          <div className="flex justify-center gap-12 mb-12">
            <a
              href="https://github.com/M4xxes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Github size={28} />
              <span className="mt-1 text-xs">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/maxime-pero-b320a3356/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Linkedin size={28} />
              <span className="mt-1 text-xs">LinkedIn</span>
            </a>
            <a
              href="mailto:maximepero12@gmail.com"
              className="flex flex-col items-center text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Mail size={28} />
              <span className="mt-1 text-xs">Mail</span>
            </a>
          </div>

          <form
            action="mailto:maximepero12@gmail.com"
            method="POST"
            encType="text/plain"
            className="space-y-6 text-left"
          >
            <div>
              <label htmlFor="name" className="block text-gray-300 mb-2">Nom</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full p-3 rounded-md bg-[#1a1a1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full p-3 rounded-md bg-[#1a1a1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full p-3 rounded-md bg-[#1a1a1a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors duration-300"
            >
              Envoyer le message
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
