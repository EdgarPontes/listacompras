'use client';

import { motion } from 'framer-motion';
import { Card, CardProps } from '@/components/ui/card';

export function AnimatedCard({ children, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  );
}
