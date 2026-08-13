import React from 'react';
import { motion } from 'framer-motion';
import { Users, Globe, Award, Heart } from 'lucide-react';

const stats = [
  { icon: <Globe className="w-4 h-4" />, label: 'Global Reach' },
  { icon: <Users className="w-4 h-4" />, label: 'Community Focused' },
  { icon: <Award className="w-4 h-4" />, label: 'Award Winning' },
  { icon: <Heart className="w-4 h-4" />, label: 'Made with Care' },
];

const team = [
  { name: 'Ansh Yadav', role: 'Developer', avatar: 'https://ui-avatars.com/api/?name=Ansh+Yadav&background=242925&color=F1F3F2&size=128' },
  { name: 'Taraksh Pratap Singh', role: 'Developer', avatar: 'https://ui-avatars.com/api/?name=Taraksh+Pratap+Singh&background=242925&color=F1F3F2&size=128' },
  { name: 'Dishan', role: 'Developer', avatar: 'https://ui-avatars.com/api/?name=Dishan+Kumar&background=242925&color=F1F3F2&size=128' },
];

const About = () => {
  const cardStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--accent)' }}>
            Our Story
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-5" style={{ color: 'var(--text)' }}>
            About TravelGenie
          </h1>
          <p className="leading-relaxed" style={{ color: 'var(--text-2)' }}>
            We are passionate about making travel planning seamless, personalized, and unforgettable.
            TravelGenie crafts itineraries that match your unique style.
          </p>
        </motion.div>

        {/* Mission */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
              alt="Our Team"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
              Our Mission
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--text-2)' }}>
              We believe every journey should be as unique as the traveler. Our mission is to eliminate planning stress and replace it with the excitement of discovery. We curate experiences that go beyond the ordinary.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl" style={cardStyle}>
                  <span style={{ color: 'var(--accent)' }}>{stat.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-10 md:p-14 rounded-2xl"
          style={cardStyle}
        >
          <h2 className="text-2xl font-semibold text-center mb-10" style={{ color: 'var(--text)' }}>
            Meet the Creators
          </h2>

          <div className="flex justify-center flex-wrap gap-10">
            {team.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center"
              >
                <img
                  src={member.avatar}
                  className="w-20 h-20 rounded-2xl mb-3"
                  style={{ border: '1px solid var(--border)' }}
                  alt={member.name}
                />
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{member.name}</h4>
                <span className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{member.role}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
