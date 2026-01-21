import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import {
  Mail,
  Phone,
  User,
  Send,
  Loader2,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';

interface TradeInquiryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradeName: string;
  tradeColor: string;
  programs: { level: string; duration: string }[];
}

interface InquiryFormData {
  fullName: string;
  email: string;
  phone: string;
  program: string;
  message: string;
}

const TradeInquiryModal: React.FC<TradeInquiryModalProps> = ({
  open,
  onOpenChange,
  tradeName,
  tradeColor,
  programs
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InquiryFormData>();

  const onSubmit = async (data: InquiryFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Inquiry submitted:', { ...data, program: selectedProgram });
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset after showing success
    setTimeout(() => {
      setIsSuccess(false);
      reset();
      setSelectedProgram('');
      onOpenChange(false);
    }, 3000);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setSelectedProgram('');
      setIsSuccess(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${tradeColor}`}>
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            Enroll in {tradeName}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below and we'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
              >
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Inquiry Submitted Successfully!
              </h3>
              <p className="text-gray-600">
                We'll contact you soon with more information about the program.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    className="pl-10"
                    {...register('fullName', { required: 'Name is required' })}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email'
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="+250..."
                      className="pl-10"
                      {...register('phone', { required: 'Phone is required' })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Program Selection */}
              <div className="space-y-2">
                <Label>Select Program *</Label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a program level" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.level} value={program.level}>
                        <div className="flex items-center justify-between w-full">
                          <span>{program.level}</span>
                          <Badge variant="outline" className="ml-2">
                            {program.duration}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Additional Message</Label>
                <div className="relative">
                  <Textarea
                    id="message"
                    placeholder="Tell us about your background and goals..."
                    rows={3}
                    {...register('message')}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !selectedProgram}
                className={`w-full h-12 bg-gradient-to-r ${tradeColor} text-white font-semibold`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Inquiry
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default TradeInquiryModal;
