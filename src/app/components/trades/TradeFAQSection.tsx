import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/app/components/ui/accordion';

interface FAQ {
  question: string;
  answer: string;
}

interface TradeFAQSectionProps {
  faqs: FAQ[];
  accentColor: string;
  borderColor: string;
}

const TradeFAQSection: React.FC<TradeFAQSectionProps> = ({
  faqs,
  accentColor,
  borderColor
}) => {
  return (
    <Card className={`border-2 ${borderColor}`}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <HelpCircle className={`w-7 h-7 mr-3 ${accentColor}`} />
          Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AccordionItem
                value={`item-${index}`}
                className={`border-2 ${borderColor} rounded-xl px-4 data-[state=open]:bg-gray-50`}
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-4">
                  <span className="flex items-start">
                    <span className={`w-6 h-6 rounded-full bg-gradient-to-r ${accentColor.replace('text-', 'from-').replace('-600', '-500')} to-${accentColor.replace('text-', '').replace('-600', '-600')} text-white flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0`}>
                      {index + 1}
                    </span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4 pl-9">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TradeFAQSection;
