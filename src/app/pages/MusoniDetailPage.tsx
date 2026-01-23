import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, MapPin, Github, Linkedin, Star, Zap, Trophy, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface MusoniDetailPageProps {
  onNavigate: (page: string) => void;
}

const MusoniDetailPage: React.FC<MusoniDetailPageProps> = ({ onNavigate }) => {
  const [developer, setDeveloper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDeveloper({
      id: 2,
      name: 'Musoni Mugisha Yves',
      role: 'Asset Tracker & Innovation Specialist',
      image: '/api/placeholder/600/600',
      email: 'yves@garden-tvet.rw',
      phone: '+250 788 234 567',
      location: 'Kigali, Rwanda',
      github: 'https://github.com/musoni-yves',
      linkedin: 'https://linkedin.com/in/musoni-yves',
      bio: "Musoni Mugisha Yves ni umuhanga mukuru mu gukurikirana ibikoresho (Asset Tracking) n'ubushakashatsi bw'ikoranabuhanga (Innovation Research) mu itsinda ry'abatunganyije sisitemu ikomeye yo gucunga ishuri. Yize muri Garden TVET School mu ishami rya Software Development Level 4 (2024-2026), aho yagaragaje ubushobozi bukomeye mu gukora sisitemu zo gukurikirana ibikoresho n'ubushakashatsi bw'ikoranabuhanga nshya zikoreshwa mu mashuri menshi mu Rwanda.\n\nIMISHINGA IKOMEYE YAKOZE:\n\n1. SMART ASSET TRACKING SYSTEM - Yatunganye sisitemu ikomeye yo gukurikirana ibikoresho 2,500+ by'ishuri ikoresheje IoT sensors, RFID technology, GPS tracking, na Real-time monitoring. Sisitemu ikoresha React 18, TypeScript, Node.js, Express, MySQL, na Redis kugira ngo ikurikirane ameza 1,248, intebe 1,248, computers 120, ibikoresho bya laboratoire 500+, n'ibikoresho bya siporo 1,000+.\n\n2. INVENTORY MANAGEMENT SYSTEM - Yashyizeho sisitemu ikomeye yo gucunga inventory ikurikirana ibikoresho 5,000+ bifite QR codes na RFID tags. Sisitemu ifite automatic notifications, approval workflows, predictive analytics, na real-time reporting. Abarimu bashobora gusaba ibikoresho bakeneye, abayobozi bemeza ibisabwa, kandi sisitemu ikurikirana ikoreshwa ry'ibikoresho byose.\n\n3. MAINTENANCE SCHEDULING SYSTEM - Yatunganye sisitemu yo gushyiraho amategeko yo kubungabunga ibikoresho ikora na 150+ technicians. Sisitemu ifite preventive maintenance calendar, automatic scheduling, technician assignment, parts inventory management, cost tracking, repair tracking, na quality assurance checks. Ikurikirana equipment reliability, maintenance costs, downtime, na performance metrics.\n\n4. ASSET DEPRECIATION CALCULATOR - Yashyizeho sisitemu yo kubara agaciro k'ibikoresho ikurikirana amafaranga 500,000,000+ RWF. Sisitemu ikoresha straight-line depreciation, declining balance, units of production, na sum-of-years digits methods. Itanga monthly depreciation reports, annual asset valuation, tax calculations, insurance valuation, na disposal value calculations.\n\n5. BARCODE & QR CODE GENERATOR - Yatunganye sisitemu yakoreye QR codes 10,000+ na barcode zikoreshwa mu gukurikirana ibikoresho. Sisitemu ifite batch generation, custom designs, mobile-optimized codes, encrypted codes, label printing, na mobile scanning apps zikoreshwa offline.\n\n6. LABORATORY EQUIPMENT MANAGEMENT - Yashyizeho sisitemu yo gucunga ibikoresho 500+ bya laboratoire harimo Chemistry Lab (156 items), Physics Lab (134 items), Biology Lab (189 items), microscopes (45), computers (120), printers (25), na scanners (15). Sisitemu ifite online reservation, calendar integration, safety compliance, chemical tracking, na incident reporting.\n\n7. COMPUTER LAB MANAGEMENT - Yatunganye sisitemu yo gucunga computers 120 za laboratoire ifite hardware tracking, software license management, performance monitoring, maintenance scheduling, student access control, session management, printing management, na internet access control.\n\n8. SPORTS EQUIPMENT TRACKING - Yashyizeho sisitemu yo gukurikirana ibikoresho 1,000+ bya siporo harimo imipira ya football (45), basketball (30), volleyball (25), athletics equipment (234), na uniforms (1,500). Sisitemu ikoresha QR codes na RFID tags kugira ngo ikurikirane aho ibikoresho biri n'uwabikoresha.\n\nTEKINOLOJI ZIGEZWEHO YAKORESHEJE:\n\nFRONTEND: React 18, TypeScript, Next.js, Tailwind CSS, Material-UI, Ant Design, Chart.js, D3.js, React Query, SWR, React Hook Form, Formik, Framer Motion\n\nBACKEND: Node.js, Express.js, NestJS, GraphQL, REST APIs, Microservices, Docker, Kubernetes, Redis, Memcached, WebSocket, Socket.io\n\nDATABASE: MySQL, PostgreSQL, MongoDB, CouchDB, Redis, Elasticsearch, Database optimization, Data migration, Backup & recovery\n\nIOT & HARDWARE: Arduino (Uno, Nano, Mega), Raspberry Pi (4, Zero), ESP32, ESP8266, RFID readers (RC522, PN532), NFC modules, GPS modules (NEO-6M, NEO-8M), Temperature sensors (DHT22, SHT30), Motion sensors (PIR, ultrasonic), Camera modules (OV2640, OV5640), LoRaWAN modules\n\nMOBILE: React Native, Expo, Flutter, Dart, Swift, Objective-C, Java, Kotlin, PWA, Cordova, PhoneGap, Xamarin\n\nCLOUD & DEVOPS: AWS, Google Cloud Platform, Microsoft Azure, Docker Compose, Kubernetes, OpenShift, Jenkins, GitLab CI/CD, Terraform, Ansible, Prometheus, Grafana, New Relic\n\nIBIHEMBO BIKOMEYE YARONSE:\n1. Best Innovation Project 2025 - Garden TVET School\n2. IoT Developer of the Year 2025 - Rwanda ICT Chamber\n3. Best Asset Management Solution 2026 - East Africa TVET Competition\n4. Young Innovator Award 2026 - Rwanda Development Board\n5. Excellence in Technology Award 2026 - Ministry of ICT\n6. Best Mobile App Developer 2025 - Rwanda Mobile Awards\n7. Innovation Leadership Award 2026 - African Innovation Foundation\n\nAMAFARANGA YINJIZA:\n- Smart Asset Tracking System: 15,000,000 RWF (5 schools)\n- IoT Solutions Development: 12,000,000 RWF (8 projects)\n- Mobile App Development: 8,500,000 RWF (15 apps)\n- Consulting Services: 6,200,000 RWF\n- Training Programs: 4,800,000 RWF\n- Hardware Integration: 7,300,000 RWF\n- Database Optimization: 3,900,000 RWF\n- Cloud Migration: 5,600,000 RWF\n\nUBUFATANYE:\nMU RWANDA: University of Rwanda, IPRC Kigali, Rwanda Polytechnic, Carnegie Mellon University Rwanda, African Leadership University\n\nIBIGO BY'UBUCURUZI: MTN Rwanda, Airtel Rwanda, Bank of Kigali, Equity Bank Rwanda, Inyange Industries\n\nAMAHANGA: MIT, Stanford University, Technical University of Munich, University of Toronto, Singapore University of Technology\n\nINTEGO ZE:\n1. Gukora sisitemu zo gukurikirana ibikoresho zikoreshwa n'amashuri 100+ mu Rwanda\n2. Kwiga Advanced Cloud Computing (AWS, Azure, GCP)\n3. Gukora IoT solutions company izafasha amashuri, amavuriro, n'ibigo by'ubucuruzi\n4. Kwiga AI na Machine Learning mu asset management\n5. Gufasha amashuri 500+ mu Rwanda gukoresha sisitemu zigezweho\n6. Gukora startup yo gukora IoT solutions ku isoko ry'Afurika y'Iburasirazuba\n7. Kwiga Blockchain technology no kuyikoresha mu asset management\n8. Gukora research center yo gukora ubushakashatsi mu IoT na AI\n9. Gufasha abanyeshuri 1,000+ kwiga programming na IoT development\n10. Gukora partnership na companies z'amahanga zo gukora tekinoloji"
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Gukuramo amakuru...</p>
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nta makuru aboneka</p>
          <Button onClick={() => onNavigate('developers')} className="mt-4">
            Subira ku batunganyije
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50">
      <div className="bg-gradient-to-r from-yellow-600 to-green-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('developers')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Subira ku batunganyije
          </Button>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold"
            >
              {developer.name.split(' ').map((n: string) => n[0]).join('')}
            </motion.div>
            
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black mb-2"
              >
                {developer.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/90 mb-4"
              >
                {developer.role}
              </motion.p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{developer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{developer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{developer.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-yellow-600" />
                Amakuru Yihariye
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
                {developer.bio}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Ubushobozi Bukuru
              </h3>
              <div className="space-y-3">
                {[
                  'Asset Management',
                  'IoT Integration', 
                  'Data Analytics',
                  'Mobile Development',
                  'Hardware Integration',
                  'System Optimization'
                ].map((skill) => (
                  <div key={skill} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Ibihembo
              </h3>
              <div className="space-y-3">
                {[
                  'Best Innovation Project 2025',
                  'IoT Developer Award 2025',
                  'Best Asset Management Solution 2026',
                  'Young Innovator Award 2026'
                ].map((award) => (
                  <div key={award} className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-700 text-sm">{award}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Github className="w-5 h-5 text-yellow-600" />
                Ihuza
              </h3>
              <div className="space-y-3">
                <a href={developer.github} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
                <a href={developer.linkedin} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MusoniDetailPage };
export default MusoniDetailPage;
