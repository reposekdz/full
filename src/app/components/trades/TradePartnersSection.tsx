import React from 'react';
import { motion } from 'motion/react';
import { Building2, Handshake, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

interface Partner {
  name: string;
  logo?: string;
  description: string;
  type: 'employment' | 'training' | 'equipment' | 'internship';
}

interface TradePartnersSectionProps {
  partners: Partner[];
  accentColor: string;
  borderColor: string;
  gradientColor: string;
}

const partnerTypeColors: Record<string, string> = {
  employment: 'bg-green-100 text-green-700 border-green-200',
  training: 'bg-blue-100 text-blue-700 border-blue-200',
  equipment: 'bg-purple-100 text-purple-700 border-purple-200',
  internship: 'bg-orange-100 text-orange-700 border-orange-200'
};

const partnerTypeLabels: Record<string, string> = {
  employment: 'Employment Partner',
  training: 'Training Partner',
  equipment: 'Equipment Partner',
  internship: 'Internship Partner'
};

const TradePartnersSection: React.FC<TradePartnersSectionProps> = ({
  partners,
  accentColor,
  borderColor,
  gradientColor
}) => {
  return (
    <Card className={`border-2 ${borderColor}`}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Handshake className={`w-7 h-7 mr-3 ${accentColor}`} />
          Industry Partners
        </CardTitle>
        <CardDescription className="text-lg">
          Companies that hire our graduates and support our programs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className={`p-4 rounded-xl border-2 ${borderColor} bg-white hover:shadow-lg transition-all cursor-pointer group`}
            >
              {/* Logo Placeholder */}
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Building2 className="w-8 h-8 text-white" />
              </div>

              {/* Partner Info */}
              <h4 className="font-bold text-gray-900 mb-1">{partner.name}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{partner.description}</p>
              
              {/* Partner Type Badge */}
              <Badge className={`${partnerTypeColors[partner.type]} border`}>
                {partnerTypeLabels[partner.type]}
              </Badge>
            </motion.div>
          ))}
        </div>

        {/* Become a Partner CTA */}
        <div className={`mt-6 p-6 rounded-xl bg-gradient-to-r ${gradientColor} text-white`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xl font-bold mb-1">Become a Partner</h4>
              <p className="text-white/90">
                Join our network and help shape the next generation of professionals
              </p>
            </div>
            <Button className="bg-white text-gray-900 hover:bg-gray-100">
              Partner With Us
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradePartnersSection;
