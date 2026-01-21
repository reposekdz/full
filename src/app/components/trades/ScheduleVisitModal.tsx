import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle2,
  Users
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
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';

interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tradeName: string;
  tradeColor: string;
}

interface VisitFormData {
  fullName: string;
  email: string;
  phone: string;
  visitType: 'individual' | 'group';
  groupSize?: string;
  preferredDate: string;
  preferredTime: string;
  specialRequests?: string;
}

const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM'
];

const ScheduleVisitModal: React.FC<ScheduleVisitModalProps> = ({
  open,
  onOpenChange,
  tradeName,
  tradeColor
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [visitType, setVisitType] = useState<'individual' | 'group'>('individual');
  const [selectedTime, setSelectedTime] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<VisitFormData>();

  const onSubmit = async (data: VisitFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Visit scheduled:', { ...data, visitType, preferredTime: selectedTime });
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      setIsSuccess(false);
      reset();
      setVisitType('individual');
      setSelectedTime('');
      onOpenChange(false);
    }, 3000);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setVisitType('individual');
      setSelectedTime('');
      setIsSuccess(false);
      onOpenChange(false);
    }
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${tradeColor}`}>
              <Calendar className="h-5 w-5 text-white" />
            </div>
            Schedule a Campus Visit
          </DialogTitle>
          <DialogDescription>
            Visit our {tradeName} facilities and meet our instructors
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
                Visit Scheduled!
              </h3>
              <p className="text-gray-600">
                We'll send you a confirmation email with all the details.
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
              {/* Visit Type */}
              <div className="space-y-2">
                <Label>Visit Type</Label>
                <RadioGroup
                  value={visitType}
                  onValueChange={(value) => setVisitType(value as 'individual' | 'group')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="cursor-pointer flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Individual
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="group" id="group" />
                    <Label htmlFor="group" className="cursor-pointer flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Group Visit
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Group Size (conditional) */}
              {visitType === 'group' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="groupSize">Group Size *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-5">2-5 people</SelectItem>
                      <SelectItem value="6-10">6-10 people</SelectItem>
                      <SelectItem value="11-20">11-20 people</SelectItem>
                      <SelectItem value="20+">20+ people</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

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

              {/* Contact Details */}
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
                      {...register('email', { required: 'Email is required' })}
                    />
                  </div>
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
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="preferredDate"
                    type="date"
                    min={minDate}
                    className="pl-10"
                    {...register('preferredDate', { required: 'Date is required' })}
                  />
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <Label>Preferred Time *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={selectedTime === time ? 'default' : 'outline'}
                      className={selectedTime === time ? `bg-gradient-to-r ${tradeColor} text-white` : ''}
                      onClick={() => setSelectedTime(time)}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  placeholder="Any special requirements or questions..."
                  rows={2}
                  {...register('specialRequests')}
                />
              </div>

              {/* Location Info */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className={`w-5 h-5 ${tradeColor.includes('blue') ? 'text-blue-600' : tradeColor.includes('green') ? 'text-green-600' : 'text-orange-600'} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="font-semibold text-gray-900">Campus Location</p>
                    <p className="text-sm text-gray-600">
                      TVET School, Kigali, Rwanda
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Free parking available for visitors
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !selectedTime}
                className={`w-full h-12 bg-gradient-to-r ${tradeColor} text-white font-semibold`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Visit
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

export default ScheduleVisitModal;
