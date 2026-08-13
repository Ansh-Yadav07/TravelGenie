import React from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Award, Heart, Sparkles, Zap, Code2, Palette } from 'lucide-react';

const stats = [
  { icon: <Globe className="w-5 h-5" />, label: 'Global Reach', color: 'blue' },
  { icon: <Users className="w-5 h-5" />, label: 'Community Focused', color: 'emerald' },
  { icon: <Award className="w-5 h-5" />, label: 'Award Winning', color: 'violet' },
  { icon: <Heart className="w-5 h-5" />, label: 'Made with Love', color: 'pink' },
];

const team = [
  { name: 'Ansh Yadav', role: 'Full Stack Developer', avatar: 'https://ui-avatars.com/api/?name=Ansh+Yadav&background=3b82f6&color=fff&size=128', icon: <Code2 size={14} />, color: 'blue' },
  { name: 'Taraksh Pratap Singh', role: 'Full Stack Developer', avatar: 'https://ui-avatars.com/api/?name=Taraksh+Pratap+Singh&background=8b5cf6&color=fff&size=128', icon: <Zap size={14} />, color: 'violet' },
  { name: 'Dishan', role: 'Full Stack Developer', avatar: 'https://ui-avatars.com/api/?name=Dishan+Kumar&background=10b981&color=fff&size=128', icon: <Palette size={14} />, color: 'emerald' },
];

const About = () => {
  return (
    <div className="pt-24 pb-16 min-h-screen mesh-bg">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider mb-6 uppercase">
            <Sparkles size={14} />
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            About <span className="text-gradient">TravelGenie</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            We are passionate about making travel planning seamless, personalized, and unforgettable.
            TravelGenie leverages cutting-edge Gemini AI to craft itineraries that match your unique style.
          </p>
        </motion.div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl overflow-hidden ring-1 ring-white/10"
          >
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
              alt="Our Team"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Our <span className="text-gradient-cool">Mission</span>
            </h2>
            <p className="text-gray-400 leading-relaxed">
              We believe that every journey should be as unique as the traveler. Our mission is to eliminate the stress of planning and replace it with the excitement of discovery. By combining human expertise with AI precision, we curate experiences that go beyond the ordinary.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 glass-card p-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-400`}>
                    {stat.icon}
                  </div>
                  <span className="font-medium text-gray-300 text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-10 md:p-14"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-10" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Meet the <span className="text-gradient-warm">Creators</span>
          </h2>

          <div className="flex justify-center flex-wrap gap-10">
            {team.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="flex flex-col items-center group"
              >
                <div className="relative mb-4">
                  <img
                    src={member.avatar}
                    className={`w-24 h-24 rounded-2xl ring-2 ring-${member.color}-500/30 group-hover:ring-${member.color}-400/60 transition-all shadow-lg`}
                    alt={member.name}
                  />
                  <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-${member.color}-500/20 border border-${member.color}-500/30 flex items-center justify-center text-${member.color}-400`}>
                    {member.icon}
                  </div>
                </div>
                <h4 className="font-bold text-white text-sm">{member.name}</h4>
                <span className={`text-${member.color}-400 text-xs mt-1`}>{member.role}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
