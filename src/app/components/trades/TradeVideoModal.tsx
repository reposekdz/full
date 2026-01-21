import React from 'react';
import { motion } from 'motion/react';
import { Play, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';

interface TradeVideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoUrl: string;
  title: string;
}

const TradeVideoModal: React.FC<TradeVideoModalProps> = ({
  open,
  onOpenChange,
  videoUrl,
  title
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            {/* Placeholder for video - in production would use actual video player */}
            <div className="text-center text-white p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
              >
                <Play className="h-12 w-12 text-white ml-2" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <p className="text-gray-400">
                Video preview would play here in production
              </p>
              <p className="text-sm text-gray-500 mt-4">
                {videoUrl}
              </p>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeVideoModal;
