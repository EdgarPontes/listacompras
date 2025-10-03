'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import * as React from 'react';

export function AnimatedCard({ children, ...props }: React.ComponentProps<typeof Card>) {
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
