import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const skills = [
  {
    category: "Languages",
    items: ["JavaScript", "TypeScript", "SQL"],
    color: "from-blue-500 to-blue-600"
  },
  {
    category: "Frontend",
    items: ["React", "Angular", "HTML5",  "Tailwind CSS"],
    color: "from-purple-500 to-purple-600"
  },
  {
    category: "Backend",
    items: ["Node.js", "Express", "MySQL"],
    color: "from-green-500 to-green-600"
  },
  {
    category: "Outils",
    items: ["Git", "VS Code", "Figma"],
    color: "from-pink-500 to-pink-600"
  }
];

const Skills = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  return (
    <section ref={ref} id="skills" className="py-20 px-4 md:px-20 bg-[#111111] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 animate-gradient-x" />
      
      <div className="max-w-5xl mx-auto relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-2xl font-mono text-blue-500 mb-12"
        >
          Compétences
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {skills.map((skillGroup, groupIndex) => (
            <motion.div
              key={skillGroup.category}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-300"
            >
              <h3 className={`text-xl font-semibold mb-4 bg-gradient-to-r ${skillGroup.color} bg-clip-text text-transparent`}>
                {skillGroup.category}
              </h3>
              <div className="flex flex-wrap gap-3">
                {skillGroup.items.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: index * 0.1 + groupIndex * 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    className={`px-3 py-1 bg-gradient-to-r ${skillGroup.color} bg-opacity-10 rounded-full text-sm cursor-default`}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;