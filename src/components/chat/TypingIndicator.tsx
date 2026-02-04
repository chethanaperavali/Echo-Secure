import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  username?: string;
}

export function TypingIndicator({ username }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 bg-secondary rounded-2xl px-4 py-2.5 rounded-bl-md">
        <motion.div
          className="w-2 h-2 bg-muted-foreground rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-muted-foreground rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
        />
        <motion.div
          className="w-2 h-2 bg-muted-foreground rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
        />
      </div>
      {username && (
        <span className="text-xs text-muted-foreground">
          {username} is typing...
        </span>
      )}
    </div>
  );
}
