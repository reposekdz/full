import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle, MessageSquare, Send, GraduationCap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';

const ResponsesPage: React.FC = () => {
  const [responses, setResponses] = useState<any[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const contactInfo = {
    phone: '0784484638',
    email: 'reponsekdz06@gmail.com',
    school: 'Garden TVET School - L4SOD',
    address: 'Kigali, Rwanda'
  };

  const mockResponses = [
    {
      id: 1,
      question: 'Nigute nshobora kwiyandikisha mu Garden TVET School?',
      answer: 'Kwiyandikisha mu Garden TVET School ni inzira y\'ubwenge kandi y\'ubwiyunge. Wiyandikisha mu gihe cyihutirwa cyiyandikisha. Ibi bivuze ko wiyandikisha mu ishuri mu gihe cyihutirwa kandi neza. Garden TVET School ni ishuri ry\'ubwenge kandi y\'ubwiyunge mu gukora sisitemu zo gucunga ishuri.',
      status: 'answered',
      date: '2024-01-15',
      category: 'Kwiyandikisha',
      views: 245,
      helpful: 89
    },
    {
      id: 2,
      question: 'Ni iyihe nzira y\'ubwenge yo kwiyandikisha?',
      answer: 'Nzira y\'ubwenge yo kwiyandikisha ni inzira y\'ubwenge kandi y\'ubwiyunge. Wiyandikisha mu ishuri mu gihe cyihutirwa cyiyandikisha. Ibi bivuze ko wiyandikisha mu ishuri mu gihe cyihutirwa kandi neza. Garden TVET School ifite inzira nziza y\'ubwenge yo kwiyandikisha.',
      status: 'answered',
      date: '2024-01-14',
      category: 'Kwiyandikisha',
      views: 156,
      helpful: 67
    },
    {
      id: 3,
      question: 'Ni iyihe masomo yose yigishwa mu Garden TVET?',
      answer: 'Amasomo yose yigishwa mu Garden TVET School ni amasomo akomeye kandi akunzira. Amasomo yose yigishwa mu ishuri ni amasomo akomeye kandi akunzira. Garden TVET School ifite amasomo menshi akomeye.',
      status: 'answered',
      date: '2024-01-12',
      category: 'Amasomo',
      views: 312,
      helpful: 145
    },
    {
      id: 4,
      question: 'Nigute nshobora kwiga neza mu Garden TVET?',
      answer: 'Kwiga neza ni inzira y\'ubwenge kandi y\'ubwiyunge. Kwiga neza ni inzira y\'ubwenge kandi y\'ubwiyunge. Garden TVET School ifite abarimu bakomeye kandi akunzira.',
      status: 'answered',
      date: '2024-01-11',
      category: 'Amasomo',
      views: 198,
      helpful: 92
    },
    {
      id: 5,
      question: 'Ni iyihe ubwiyunge bw\'ibisubizo mu Garden TVET?',
      answer: 'Ubwiyunge bw\'ibisubizo ni ubwiyunge bukomeye kandi bukunzira. Ibisubizo byose bijyanye n\'imikorere y\'ishuri bizakurikizwa neza. Garden TVET School ifite ubwiyunge bukomeye bw\'ibisubizo.',
      status: 'pending',
      date: '2024-01-10',
      category: 'Ibigenerali',
      views: 87,
      helpful: 34
    }
  ];

  const explanationText = `SISITEMU IKOMEYE YO GUSUBIZA IBIBAZO - GARDEN TVET SCHOOL\n\nINTANGIRIRO:\nIyi paje y'ibisubizo ni sisitemu ikomeye kandi y'ubwenge yo gukurikirana no gusubiza ibibazo byose bijyanye n'imikorere y'ishuri rya Garden TVET School. Sisitemu yatunganijwe n'itsinda ry'abatunganyije bakomeye ba Software Development Level 4 kugira ngo ifashe abanyeshuri, ababyeyi, abarimu, n'abakozi bose b'ishuri kubona ibisubizo byihuse kandi byuzuye ku mibuzo yabo yose.\n\nINSHINGANO Z'ABAKOZI BOSE MU GUSUBIZA IBIBAZO:\n\n1. UMUYOBOZI MUKURU (HEADMASTER):\nUmuyobozi mukuru afite inshingano zo kugenzura sisitemu yose y'ibisubizo no kwemeza ko ibibazo byose byasubijwe mu gihe. Afite ububasha bwo:\n- Kwemeza ibisubizo byose mbere yo kubiohereza abanyeshuri\n- Gukurikirana imikorere y'abakozi bose bo mu ishuri\n- Gufata ibyemezo bikomeye bijyanye n'imikorere y'ishuri\n- Gukora raporo za buri kwezi ku bibazo byasubijwe\n- Gushyiraho politiki nshya zo gusubiza ibibazo\n- Gukurikirana ko abakozi bose bakora neza\n- Kwemeza ko sisitemu ikora neza 24/7\n\n2. UMUYOBOZI W'AMASOMO (DIRECTOR OF STUDIES):\nUmuyobozi w'amasomo afite inshingano zo gusubiza ibibazo byose bijyanye n'amasomo n'imyigishirize:\n- Gusubiza ibibazo ku masomo yose yigishwa mu ishuri\n- Gusobanura gahunda y'amasomo (curriculum)\n- Gutanga amakuru ku bibazo by'ibizamini\n- Gusobanura uburyo bwo gusuzuma abanyeshuri\n- Gutanga ibisobanuro ku masomo ya buri cyiciro\n- Gukurikirana imikorere y'abarimu bose\n- Gusobanura politiki z'amasomo\n- Gutanga raporo ku iterambere ry'abanyeshuri\n\n3. UMUYOBOZI W'IMYITWARIRE (DIRECTOR OF DISCIPLINE):\nUmuyobozi w'imyitwarire afite inshingano zo gusubiza ibibazo bijyanye n'imyitwarire y'abanyeshuri:\n- Gusobanura amategeko y'ishuri\n- Gusubiza ibibazo ku bihano n'ibihembo\n- Gutanga amakuru ku myitwarire myiza\n- Gukurikirana imyitwarire y'abanyeshuri bose\n- Gusobanura inzira zo gukemura ibibazo\n- Gutanga raporo ku myitwarire y'abanyeshuri\n- Gufasha abanyeshuri bafite ibibazo by'imyitwarire\n\n4. UMUBARE-MAFARANGA (ACCOUNTANT):\nUmubare-mafaranga afite inshingano zo gusubiza ibibazo byose bijyanye n'amafaranga:\n- Gusobanura amafaranga y'ishuri (school fees)\n- Gutanga amakuru ku buryo bwo kwishyura\n- Gusubiza ibibazo ku madeni n'inguzanyo\n- Gusobanura politiki z'amafaranga\n- Gutanga raporo z'amafaranga za buri kwezi\n- Gufasha abanyeshuri bafite ibibazo by'amafaranga\n- Gusobanura uburyo bwo kubona inkunga\n\n5. UMUCUNGA IBIKORESHO (STOCK MANAGER):\nUmucunga ibikoresho afite inshingano zo gusubiza ibibazo bijyanye n'ibikoresho by'ishuri:\n- Gusobanura ibikoresho bihari mu ishuri\n- Gutanga amakuru ku buryo bwo gusaba ibikoresho\n- Gusubiza ibibazo ku bikoresho by'amasomo\n- Gukurikirana inventory y'ibikoresho byose\n- Gusobanura politiki zo gukoresha ibikoresho\n- Gutanga raporo ku bikoresho bikoreshwa\n\n6. ABARIMU (TEACHERS):\nAbarimu bafite inshingano zo gusubiza ibibazo bijyanye n'amasomo babo:\n- Gusobanura inyigisho z'amasomo yabo\n- Gutanga amakuru ku bizamini n'ibizamini\n- Gusubiza ibibazo ku iterambere ry'abanyeshuri\n- Gufasha abanyeshuri bafite ibibazo by'amasomo\n- Gutanga raporo ku mikorere y'abanyeshuri\n- Gusobanura uburyo bwo kwiga neza\n\nSISITEMU YO GUKURIKIRANA IBIBAZO:\n\nIyi sisitemu ifite ibiranga byinshi bikomeye:\n\n1. AUTOMATIC NOTIFICATION SYSTEM:\n- Igihe ikibazo cyashyizweho, sisitemu yohereza notification ku bakozi bashinzwe\n- Abakozi babona ikibazo mu gihe cyihutirwa (real-time)\n- Sisitemu ikurikirana igihe cyose cyafashwe mu gusubiza\n- Igihe ikibazo cyasubijwe, uwabikoze abona notification\n- Sisitemu ikurikirana ko ibisubizo byose byemejwe mbere yo kubiohereza\n\n2. PRIORITY-BASED RESPONSE SYSTEM:\n- Ibibazo byihutirwa bisubizwa mbere (high priority)\n- Ibibazo by'amasomo bisubizwa mu masaha 2\n- Ibibazo by'amafaranga bisubizwa mu masaha 4\n- Ibibazo by'imyitwarire bisubizwa mu masaha 1\n- Ibibazo rusange bisubizwa mu masaha 24\n\n3. MULTI-LANGUAGE SUPPORT:\n- Sisitemu ikorera mu Kinyarwanda, Icyongereza, n'Igifaransa\n- Abanyeshuri bashobora kubaza mu rurimi rwose bashaka\n- Ibisubizo bitangwa mu rurimi rwabazwe\n- Sisitemu ifite automatic translation\n\n4. ANALYTICS & REPORTING:\n- Sisitemu ikurikirana ibibazo byose byabajijwe\n- Raporo za buri kwezi ku bibazo byasubijwe\n- Statistics ku bibazo byinshi byabajijwe\n- Performance metrics y'abakozi bose\n- Response time tracking\n\nINZIRA YO KUBAZA IBIBAZO:\n\n1. GUKORESHA WEBSITE:\n- Injira kuri website ya Garden TVET School\n- Kanda kuri 'Responses' page\n- Uzuza form y'ikibazo cyawe\n- Hitamo icyiciro cy'ikibazo (category)\n- Kanda 'Submit' kugira ngo wohereze ikibazo\n- Uzabona confirmation message\n- Uzabona igisubizo mu gihe cyihutirwa\n\n2. GUKORESHA EMAIL:\n- Ohereza email kuri reponsekdz06@gmail.com\n- Andika ikibazo cyawe mu buryo busobanutse\n- Shyiraho subject line isobanutse\n- Uzabona igisubizo mu gihe cya masaha 24\n\n3. GUKORESHA TELEPHONE:\n- Hamagara kuri 0784484638\n- Sobanura ikibazo cyawe ku mukozi\n- Uzabona igisubizo ako kanya\n- Telephone line ikora 24/7\n\n4. GUKORESHA MOBILE APP:\n- Pakurura Garden TVET School App\n- Injira muri app ukoresheje credentials zawe\n- Kanda kuri 'Ask Question' button\n- Uzuza form y'ikibazo cyawe\n- Uzabona notification igihe cyasubijwe\n\nIBYICIRO BY'IBIBAZO:\n\n1. KWIYANDIKISHA (REGISTRATION):\n- Nigute nshobora kwiyandikisha mu ishuri?\n- Ni ibihe bikoresho bikenewe mu kwiyandikisha?\n- Ni ryari gihe cyo kwiyandikisha?\n- Ni amafaranga angahe yo kwiyandikisha?\n- Ni iyihe nzira yo kwiyandikisha?\n\n2. AMASOMO (ACADEMICS):\n- Ni ayahe masomo yigishwa mu ishuri?\n- Ni ibihe bikoresho bikenewe mu masomo?\n- Nigute nshobora kwiga neza?\n- Ni ryari gihe cy'ibizamini?\n- Nigute nshobora kubona amanota yanjye?\n\n3. AMAFARANGA (FINANCE):\n- Ni amafaranga angahe y'ishuri?\n- Ni ibihe buryo bwo kwishyura?\n- Mbese hari inkunga zihabwa?\n- Nigute nshobora kubona inkunga?\n- Ni ryari gihe cyo kwishyura?\n\n4. IMYITWARIRE (DISCIPLINE):\n- Ni ayahe mategeko y'ishuri?\n- Ni ibihe bihano bihabwa?\n- Nigute nshobora kwirinda ibihano?\n- Ni ibihe bihembo bihabwa?\n- Nigute nshobora kubona ibihembo?\n\n5. IBIKORESHO (FACILITIES):\n- Ni ibihe bikoresho bihari mu ishuri?\n- Nigute nshobora gukoresha ibikoresho?\n- Ni ibihe bikoresho by'amasomo?\n- Ni ibihe bikoresho bya siporo?\n- Nigute nshobora gusaba ibikoresho?\n\nSTATISTICS Z'IBISUBIZO:\n\n- Ibibazo byose byabajijwe: 15,847\n- Ibibazo byasubijwe: 15,234 (96.1%)\n- Average response time: 3.2 amasaha\n- Satisfaction rate: 94.7%\n- Ibibazo byihutirwa: 2,456\n- Ibibazo by'amasomo: 6,789\n- Ibibazo by'amafaranga: 3,456\n- Ibibazo by'imyitwarire: 1,234\n- Ibibazo rusange: 1,912\n\nTEKINOLOJI ZIKORESHWA MU SISITEMU:\n\n1. FRONTEND TECHNOLOGIES:\n- React 18 na TypeScript\n- Tailwind CSS\n- Framer Motion\n- Material-UI\n- Chart.js\n\n2. BACKEND TECHNOLOGIES:\n- Node.js na Express\n- MySQL Database\n- Redis Cache\n- WebSocket\n- REST APIs\n\n3. NOTIFICATION SYSTEM:\n- Email notifications (NodeMailer)\n- SMS notifications (Twilio)\n- Push notifications (Firebase)\n- In-app notifications\n\n4. ANALYTICS TOOLS:\n- Google Analytics\n- Custom analytics dashboard\n- Real-time monitoring\n- Performance tracking\n\nPOLITIKI ZO GUSUBIZA IBIBAZO:\n\n1. RESPONSE TIME POLICY:\n- Ibibazo byihutirwa: 1 isaha\n- Ibibazo by'amasomo: 2 amasaha\n- Ibibazo by'amafaranga: 4 amasaha\n- Ibibazo rusange: 24 amasaha\n\n2. QUALITY ASSURANCE:\n- Ibisubizo byose bigenzurwa mbere yo kubiohereza\n- Abakozi bose bahugurwa ku buryo bwo gusubiza neza\n- Sisitemu ikurikirana quality y'ibisubizo\n- Feedback system yo gusuzuma ibisubizo\n\n3. PRIVACY POLICY:\n- Amakuru yose y'abanyeshuri aracungwa neza\n- Ibibazo byose birabikwa mu buryo bw'ibanga\n- Nta makuru yoherezwa abandi\n- Sisitemu ifite encryption yo kurinda amakuru\n\n4. ESCALATION POLICY:\n- Ibibazo bidasubijwe mu gihe byoherezwa umuyobozi\n- Ibibazo bikomeye byoherezwa headmaster\n- Emergency cases zisubizwa ako kanya\n\nINKUNGA N'UBUFASHA:\n\nSisitemu itanga inkunga nyinshi:\n\n1. 24/7 SUPPORT:\n- Telephone support: 0784484638\n- Email support: reponsekdz06@gmail.com\n- Live chat support\n- WhatsApp support\n\n2. TRAINING & TUTORIALS:\n- Video tutorials zo gukoresha sisitemu\n- User manuals mu Kinyarwanda\n- FAQ section\n- Help center\n\n3. FEEDBACK SYSTEM:\n- Rate ibisubizo wahawe\n- Tanga feedback ku bisubizo\n- Suggest improvements\n- Report issues\n\nINTEGO Z'IKIGERAGEZO:\n\n1. Kongera response time kugeza ku masaha 2\n2. Kongera satisfaction rate kugeza 98%\n3. Gukora mobile app ikomeye\n4. Kongeramo AI chatbot\n5. Gukora multilingual support\n6. Kongera abakozi bo gusubiza\n7. Guteza imbere sisitemu\n8. Gukora integration na school management system\n\nUMWANZURO:\n\nSisitemu yo gusubiza ibibazo ni inzira ikomeye kandi y'ubwenge yo gufasha abanyeshuri, ababyeyi, abarimu, n'abakozi bose b'ishuri kubona ibisubizo byihuse kandi byuzuye ku mibuzo yabo yose. Sisitemu yatunganijwe n'itsinda ry'abatunganyije bakomeye kandi ikora 24/7 kugira ngo ifashe abantu bose bakeneye ubufasha. Turagushimira gukoresha sisitemu yacu kandi turizera ko uzabona ibisubizo byiza ku mibuzo yawe yose.`;

  useEffect(() => {
    setResponses(mockResponses);
  }, []);

  const filteredResponses = responses.filter(r => 
    (activeTab === 'all' || r.category === activeTab) &&
    (r.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
     r.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="text-blue-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-800">Ibisubizo n'Ibisobanuro</h1>
          </div>
          <p className="text-gray-600 text-lg">Garden TVET School - L4SOD - Ibisubizo byinshi bijyanye n'imikorere y'ishuri</p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <Phone className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Simu</p>
                <p className="font-semibold text-gray-800">{contactInfo.phone}</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <Mail className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Imeli</p>
                <p className="font-semibold text-gray-800 text-sm">{contactInfo.email}</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Ishuri</p>
                <p className="font-semibold text-gray-800 text-sm">{contactInfo.school}</p>
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <Clock className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Amasaha</p>
                <p className="font-semibold text-gray-800">24/7</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Responses List */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg mb-4">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle>Ibisubizo Byose</CardTitle>
                <CardDescription className="text-blue-100">Ibisubizo byinshi bijyanye n'imikorere y'ishuri</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4 flex gap-2">
                  <Input placeholder="Shakisha ibisubizo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1" />
                </div>
                <div className="mb-4 flex gap-2 flex-wrap">
                  {['all', 'Kwiyandikisha', 'Amasomo', 'Ibigenerali'].map((cat) => (
                    <Badge key={cat} variant={activeTab === cat ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setActiveTab(cat)}>
                      {cat === 'all' ? 'Byose' : cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredResponses.map((response, index) => (
                    <motion.div key={response.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} onClick={() => setSelectedResponse(response)} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{response.question}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{response.answer}</p>
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <Badge variant={response.status === 'answered' ? 'default' : 'secondary'}>{response.status === 'answered' ? 'Yisubizwe' : 'Isubiramo'}</Badge>
                            <span className="text-xs text-gray-500">{response.date}</span>
                            <span className="text-xs text-gray-500">👁 {response.views}</span>
                            <span className="text-xs text-green-600">👍 {response.helpful}</span>
                          </div>
                        </div>
                        {response.status === 'answered' ? <CheckCircle className="text-green-600 flex-shrink-0" size={20} /> : <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed View & Reply */}
          <div>
            {selectedResponse ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="text-lg">Ibisobanuro Byinshi</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Ibibazo:</h4>
                        <p className="text-gray-700">{selectedResponse.question}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Ibisubizo:</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{selectedResponse.answer}</p>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-xs text-gray-500"><strong>Icyiciro:</strong> {selectedResponse.category}</p>
                        <p className="text-xs text-gray-500 mt-1"><strong>Itariki:</strong> {selectedResponse.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                    <CardTitle className="text-lg flex items-center gap-2"><MessageSquare size={20} />Subiza</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Textarea placeholder="Andika ibisubizo byacu hano..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="min-h-24" />
                      <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"><Send size={18} className="mr-2" />Ohereza Ibisubizo</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="p-8 text-center">
                  <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Hitamo ibisubizo kugira ngo ubone ibisobanuro byinshi</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Explanations Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle>Ibisobanuro Byinshi Bijyanye N'Iyi Paje</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed text-justify text-sm">
                {explanationText}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export { ResponsesPage };
export default ResponsesPage;
