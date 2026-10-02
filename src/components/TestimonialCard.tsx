import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  location: string;
  image: string;
  quote: string;
  rating: number;
  delay?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  location,
  image,
  quote,
  rating,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="bg-gray-800 rounded-2xl p-6 hover:bg-gray-750 transition-colors"
    >
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={image}
          alt={name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-red-500"
        />
        <div>
          <h4 className="font-semibold text-white">{name}</h4>
          <div className="flex items-center space-x-1 text-gray-400 text-sm">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
        </div>
      </div>
      <div className="flex space-x-1 mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed italic">"{quote}"</p>
    </motion.div>
  );
};

export default TestimonialCard;
