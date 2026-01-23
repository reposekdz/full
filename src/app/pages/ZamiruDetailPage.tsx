import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, MapPin, Github, Linkedin, Code, Award, Briefcase, GraduationCap, Star, Zap, Trophy, Target, CheckCircle, Calendar, Users, BookOpen, Database, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface ZamiruDetailPageProps {
  onNavigate: (page: string) => void;
}

const ZamiruDetailPage: React.FC<ZamiruDetailPageProps> = ({ onNavigate }) => {
  const [developer, setDeveloper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Use default data for Zamiru Yazid Surayman
    setDeveloper({
      id: 3,
      name: 'Zamiru Yazid Surayman',
      role: 'Secretary & Data Gathering Specialist',
      image: '/api/placeholder/600/600',
      email: 'yazid@garden-tvet.rw',
      phone: '+250 788 345 678',
      location: 'Kigali, Rwanda',
      github: 'https://github.com/zamiru-yazid',
      linkedin: 'https://linkedin.com/in/zamiru-yazid',
      bio: `Zamiru Yazid Surayman ni umuhanga mu gukusanya amakuru (Data Gathering) n'ubunyangamugayo bw'itsinda (Team Secretary) mu itsinda ry'abatunganyije sisitemu ikomeye yo gucunga ishuri. Yize muri Garden TVET School mu ishami rya Software Development Level 4, aho yagaragaje ubushobozi bukomeye mu gukusanya, gusesengura, no gutunganya amakuru y'ishuri.

Nk'umuhanga mu gukusanya amakuru, Yazid yafashe inshingano zo gukusanya amakuru yose akenewe mu gukora sisitemu, gusesengura amakuru, no gutunganya raporo. Yagize uruhare runini mu gushyira mu bikorwa tekinoloji zigezweho nko Python, R, Excel, Power BI, na SQL mu gukusanya no gusesengura amakuru.

IMYUGA N'UBUMENYI:
Yazid afite ubumenyi bukomeye mu gukusanya no gusesengura amakuru (Data Collection & Analysis). Yize gukoresha Python na R mu gusesengura amakuru, SQL mu gukuramo amakuru muri database, Excel na Power BI mu gukora raporo, na Google Forms mu gukusanya amakuru. Yagize uruhare runini mu gushyira mu bikorwa:

1. SISITEMU YO GUKUSANYA AMAKURU Y'ABANYESHURI
Yatunganye sisitemu ikomeye yo gukusanya amakuru y'abanyeshuri harimo amakuru y'ibanze, amanota, kwitabira, n'amakuru y'ababyeyi. Sisitemu ikoresha forms zidasanzwe na validation rules kugira ngo yemeze ko amakuru ari ukuri.

2. DATA WAREHOUSE SYSTEM
Yashyizeho sisitemu yo kubika amakuru (Data Warehouse) aho amakuru yose y'ishuri abikwa mu buryo bwiza kandi ashobora gukurwa vuba. Sisitemu ikoresha ETL processes (Extract, Transform, Load) kugira ngo itunganyirize amakuru.

3. REPORTING & ANALYTICS DASHBOARD
Yatunganye dashboard yo gukora raporo n'imibare aho abayobozi bashobora kureba:
- Imibare y'abanyeshuri
- Amanota n'iterambere ry'abanyeshuri
- Kwitabira amasomo
- Amafaranga y'ishuri
- Raporo z'abarimu

4. STUDENT PERFORMANCE ANALYTICS
Yashyizeho sisitemu yo gusesengura imikorere y'abanyeshuri (Student Performance Analytics) ikoresheje Machine Learning algorithms kugira ngo ihanure abanyeshuri bashobora gutsinda cyangwa guhura n'ibibazo.

5. AUTOMATED REPORT GENERATION
Yatunganye sisitemu yo gukora raporo mu buryo bwikora (Automated Report Generation) aho raporo zikora buri munsi, buri cyumweru, na buri kwezi zikohererezwa abayobozi.

IMISHINGA YAKOZE:
Yazid yagize uruhare runini mu gukora imishinga myinshi:

1. Comprehensive Data Management System (2024-2026)
Umushinga mukuru w'impamyabumenyi ufite ibiranga byinshi nko:
- Student data collection na management
- Academic performance tracking
- Attendance monitoring system
- Financial data analysis
- Staff performance metrics
- Parent feedback collection
- Alumni tracking system

2. School Analytics Platform
Platform yo gusesengura amakuru y'ishuri aho:
- Real-time data visualization
- Predictive analytics kugira ngo ihanure trends
- Performance benchmarking
- Custom report generation
- Data export capabilities

3. Survey & Feedback Management System
Sisitemu yo gukusanya ibitekerezo (Survey & Feedback) aho:
- Online survey creation
- Automated data collection
- Response analysis na visualization
- Feedback tracking na follow-up
- Multi-language support

4. Academic Records Management System
Sisitemu yo gucunga inyandiko z'amasomo aho:
- Transcript generation
- Grade history tracking
- Certificate management
- Academic progress monitoring
- Graduation requirements tracking

5. Data Quality Assurance System
Sisitemu yo kwemeza ubwiza bw'amakuru aho:
- Data validation rules
- Duplicate detection na removal
- Data cleansing processes
- Quality metrics tracking
- Error reporting na correction

TEKINOLOJI YAKORESHEJE:
Yazid yakoresha tekinoloji zigezweho:

Data Analysis:
- Python na pandas, numpy, matplotlib
- R na ggplot2, dplyr, tidyr
- SQL na MySQL, PostgreSQL
- Excel na advanced formulas, pivot tables
- Power BI na Tableau kugira ngo akore visualizations

Backend Development:
- Node.js na Express
- Python Flask na Django
- RESTful APIs
- Database design na optimization
- ETL processes

Frontend Development:
- React na TypeScript
- Chart.js na D3.js kugira ngo akore data visualization
- Tailwind CSS
- Responsive design

Data Collection Tools:
- Google Forms na Microsoft Forms
- Survey Monkey na Typeform
- Web scraping tools
- API integrations

UBUSHOBOZI BWE:
1. Data Collection - Ubushobozi bwo gukusanya amakuru
2. Data Analysis - Ubushobozi bwo gusesengura amakuru
3. Statistical Analysis - Ubushobozi bwo gukora imibare
4. Report Writing - Ubushobozi bwo kwandika raporo
5. Data Visualization - Ubushobozi bwo kwerekana amakuru
6. Database Management - Ubushobozi bwo gucunga database
7. Research Methods - Ubushobozi bwo gukora ubushakashatsi
8. Project Documentation - Ubushobozi bwo kwandika documentation

IBYATANZWE:
1. Yatunganye sisitemu ikomeye yo gukusanya amakuru y'abanyeshuri
2. Yashyizeho data warehouse system
3. Yatunganye reporting na analytics dashboard
4. Yashyizeho student performance analytics
5. Yatunganye automated report generation system
6. Yashyizeho survey na feedback management system
7. Yatunganye academic records management system
8. Yashyizeho data quality assurance system
9. Yatunganye school analytics platform
10. Yashyizeho data backup na recovery system

IMYIGISHIRIZE:
Yazid yize muri Garden TVET School mu ishami rya Software Development Level 4 (2024-2026). Yize amasomo menshi arimo:
- Data Science na Analytics
- Database Design na Management
- Statistical Analysis na Research Methods
- Business Intelligence na Reporting
- Web Development (Frontend & Backend)
- Project Management
- Technical Writing na Documentation
- Data Privacy na Security

INTEGO ZE:
Yazid afite intego zo:
1. Gukomeza gukora sisitemu zo gukusanya no gusesengura amakuru
2. Kwiga Machine Learning na Artificial Intelligence
3. Gukora Data Science solutions mu Rwanda
4. Kwiga Cloud Computing na Big Data technologies
5. Gufasha amashuri menshi gukoresha data-driven decisions
6. Gukora startup yo gukora analytics solutions

AMAFARANGA YINJIZA:
1. Data Management System - 3,500,000 RWF
2. Analytics Platform - 2,800,000 RWF
3. Survey Solutions - 1,500,000 RWF
4. Consulting Services - 2,000,000 RWF

IBIHEMBO YARONSE:
1. Best Data Analysis Project 2025 - Garden TVET School
2. Research Excellence Award 2025 - Rwanda ICT Chamber
3. Best Analytics Solution 2026 - TVET Competition
4. Young Data Scientist Award 2026 - Rwanda Development Board

ITSINDA AKORA:
Yazid akora mu itsinda rifite abantu 4:
1. Niyonkuru Reponse - Team Owner & System Development Manager
2. Musoni Mugisha Yves - Asset Tracker & Innovation Specialist
3. Zamiru Yazid Surayman - Secretary & Data Gathering Specialist
4. Niyonsenga Frank - Team Representative & Advisor

IBIKORWA BYE:
1. Data Science Club - Umuyobozi wa club yo gusesengura amakuru
2. Research Workshop - Umwarimu wa workshop z'ubushakashatsi
3. Analytics Training - Umwigisha mu gusesengura amakuru
4. Documentation Management - Umucunga w'inyandiko
5. Quality Assurance - Umugenzuzi w'ubwiza bw'amakuru

AMAHUGURWA YATANZE:
1. Data Collection Best Practices
2. Statistical Analysis Fundamentals
3. Report Writing Techniques
4. Database Design Principles
5. Data Visualization Methods

IMISHINGA AZAKORA:
1. AI-Powered Analytics Platform - Platform yo gusesengura amakuru ikoresheje AI
2. Blockchain Data Registry - Sisitemu yo kwandika amakuru muri blockchain
3. Real-time Data Streaming - Sisitemu yo gukuramo amakuru mu gihe nyacyo
4. Predictive Analytics Engine - Sisitemu yo guhanura ibizaza
5. Natural Language Processing - Sisitemu yo gusoma no gusobanura inyandiko

UBUFATANYE:
Yazid afatanyije n'amashuri menshi mu Rwanda:
1. National Institute of Statistics Rwanda (NISR)
2. University of Rwanda - School of Economics
3. Rwanda Development Board - Research Division
4. Private Research Companies

UBWIYUNGE BWE:
Yazid ni umuntu wiyunge cyane mu gukoresha amakuru mu gufata ibyemezo. Yifuza ko amashuri yose mu Rwanda azakoresha amakuru mu gufata ibyemezo byiza bizafasha abanyeshuri gutsinda.

RAPORO YAKOZE:
Yazid yakoze raporo nyinshi z'ingenzi:

1. Student Performance Analysis Report 2025
Raporo y'imikorere y'abanyeshuri mu mwaka wa 2025 yerekana:
- Amanota y'abanyeshuri mu masomo atandukanye
- Trends z'iterambere ry'abanyeshuri
- Factors zifasha abanyeshuri gutsinda
- Recommendations zo guteza imbere ubwigenge

2. School Financial Analysis Report 2025
Raporo y'amafaranga y'ishuri yerekana:
- Income na expenses analysis
- Budget performance tracking
- Cost per student calculations
- Revenue optimization recommendations

3. Teacher Performance Evaluation Report 2025
Raporo y'imikorere y'abarimu yerekana:
- Teaching effectiveness metrics
- Student feedback analysis
- Professional development needs
- Performance improvement recommendations

4. Infrastructure Utilization Report 2025
Raporo y'ikoreshwa ry'ibikoresho yerekana:
- Classroom utilization rates
- Equipment usage statistics
- Maintenance requirements
- Capacity planning recommendations

5. Parent Satisfaction Survey Report 2025
Raporo y'uko ababyeyi bishimiye yerekana:
- Parent satisfaction levels
- Areas of concern
- Communication effectiveness
- Service improvement suggestions

AMAKURU AKUSANYA:
Yazid akusanya amakuru menshi mu ishuri:

1. Student Data:
- Personal information
- Academic records
- Attendance data
- Behavioral records
- Health information

2. Teacher Data:
- Professional qualifications
- Teaching performance
- Training records
- Evaluation results
- Professional development

3. Financial Data:
- School fees collection
- Operational expenses
- Budget allocations
- Revenue sources
- Cost analysis

4. Infrastructure Data:
- Building conditions
- Equipment inventory
- Maintenance records
- Utilization rates
- Capacity planning

5. Academic Data:
- Curriculum information
- Exam results
- Grade distributions
- Subject performance
- Learning outcomes

SISITEMU ZO GUKUSANYA AMAKURU:
1. Online Forms - Forms zo mu rubuga
2. Mobile Apps - Apps zo mu telefoni
3. Barcode Scanners - Ibisoma barcode
4. RFID Systems - Sisitemu za RFID
5. API Integrations - Guhuza API
6. Manual Data Entry - Kwinjiza amakuru mu ntoki
7. File Imports - Gutumiza dosiye
8. Database Queries - Gukuramo amakuru muri database`
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-600" />
                Amakuru Yihariye
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
                {developer.bio}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Ubushobozi Bukuru
              </h3>
              <div className="space-y-3">
                {[
                  'Data Collection',
                  'Data Analysis', 
                  'Statistical Analysis',
                  'Report Writing',
                  'Data Visualization',
                  'Database Management'
                ].map((skill, index) => (
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
                <Trophy className="w-5 h-5 text-blue-600" />
                Ibihembo
              </h3>
              <div className="space-y-3">
                {[
                  'Best Data Analysis Project 2025',
                  'Research Excellence Award 2025',
                  'Best Analytics Solution 2026',
                  'Young Data Scientist Award 2026'
                ].map((award, index) => (
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
                <Github className="w-5 h-5 text-blue-600" />
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

export default ZamiruDetailPage;