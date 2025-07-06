import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section ref={ref} id="about" className="py-20 px-4 md:px-20">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-2xl font-mono text-blue-500 mb-8"
        >
          À propos de moi
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6 text-gray-300"
        >
          <p className="text-lg">
            Je suis un développeur web passionné par l'informatique et la technologie.
            Mon parcours m'a permis de maîtriser un éventail de technologies modernes et de bonnes pratiques
            de développement.
          </p>
          <p className="text-lg">
          Spécialisé en développement web full stack, je combine expertise technique et sens de l’interface pour concevoir des applications web complètes, performantes et centrées utilisateur.
          </p>
          <p className="text-lg">
            Mon approche est centrée sur la qualité du code, l'expérience utilisateur et l'innovation
            technologique.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About