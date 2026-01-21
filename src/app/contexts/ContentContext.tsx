import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
  sort_order: number;
}

interface Trade {
  id: number;
  code: string;
  title: string;
  description: string;
  image_url: string;
  total_students: number;
  graduation_rate: number;
  employment_rate: number;
  average_salary: string;
  industry_partners: number;
  is_active: boolean;
}

interface ContentContextType {
  slides: Slide[];
  trades: Trade[];
  loading: boolean;
  error: string | null;
  refreshSlides: () => Promise<void>;
  refreshTrades: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'http://localhost:5000/api';

  const fetchSlides = async () => {
    try {
      const response = await fetch(`${API_BASE}/content/slides`);
      const data = await response.json();
      if (data.success) {
        setSlides(data.slides);
      } else {
        setError('Failed to load slides');
      }
    } catch (err) {
      console.error('Failed to fetch slides:', err);
      // Fallback to default slides
      setSlides([
        {
          id: 1,
          title: 'EMPOWERING FUTURE SKILLS',
          subtitle: 'Building Tomorrow\'s Professionals Today',
          description: 'Join thousands of students who have transformed their careers through our comprehensive technical programs.',
          image_url: 'https://images.unsplash.com/photo-1758270704524-596810e891b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNsYXNzcm9vbSUyMGxlYXJuaW5nfGVufDF8fHx8MTc2ODc2NTA2NXww&ixlib=rb-4.1.0&q=80&w=1080',
          button_text: 'Get Started',
          button_link: '/register',
          is_active: true,
          sort_order: 1
        },
        {
          id: 2,
          title: 'SOFTWARE DEVELOPMENT',
          subtitle: 'Master Coding & Technology',
          description: 'Master practical skills with our modern facilities and expert instructors in Software Development, Construction, and Automotive Technology.',
          image_url: 'https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kaW5nfGVufDF8fHx8MTc2ODcxODI3MXww&ixlib=rb-4.1.0&q=80&w=1080',
          button_text: 'Learn More',
          button_link: '/trades',
          is_active: true,
          sort_order: 2
        },
        {
          id: 3,
          title: 'BUILDING CONSTRUCTION',
          subtitle: 'Create Tomorrow\'s Infrastructure',
          description: 'Learn construction techniques, project management, and safety protocols with modern tools and sustainable building practices.',
          image_url: 'https://images.unsplash.com/photo-1672072830247-85ac23671e96?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBidWlsZGluZyUyMHNpdGV8ZW58MXx8fHwxNzY4NzMwNzQ0fDA',
          button_text: 'Explore',
          button_link: '/trades',
          is_active: true,
          sort_order: 3
        },
        {
          id: 4,
          title: 'AUTOMOBILE TECHNOLOGY',
          subtitle: 'Drive Your Future Forward',
          description: 'Comprehensive automotive training covering diagnostics, repair, and modern vehicle technologies including hybrid and electric systems.',
          image_url: 'https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvbW9iaWxlJTIwbWVjaGFuaWMlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3Njg4MDYyMTl8MA',
          button_text: 'Discover',
          button_link: '/trades',
          is_active: true,
          sort_order: 4
        }
      ]);
    }
  };

  const fetchTrades = async () => {
    try {
      const response = await fetch(`${API_BASE}/content/trades`);
      const data = await response.json();
      if (data.success) {
        setTrades(data.trades);
      } else {
        setError('Failed to load trades');
      }
    } catch (err) {
      console.error('Failed to fetch trades:', err);
      // Fallback to default trades
      setTrades([
        {
          id: 1,
          code: 'SOD',
          title: 'Software Development',
          description: 'Master modern programming languages, frameworks, and development methodologies. Build web applications, mobile apps, and enterprise software solutions.',
          image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
          total_students: 420,
          graduation_rate: 96.5,
          employment_rate: 94.2,
          average_salary: '$85,000',
          industry_partners: 25,
          is_active: true
        },
        {
          id: 2,
          code: 'BDC',
          title: 'Building & Construction',
          description: 'Learn construction techniques, project management, and safety protocols. Work with modern tools and sustainable building practices.',
          image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
          total_students: 380,
          graduation_rate: 92.8,
          employment_rate: 89.5,
          average_salary: '$72,000',
          industry_partners: 18,
          is_active: true
        },
        {
          id: 3,
          code: 'AUT',
          title: 'Automobile Technology',
          description: 'Comprehensive automotive training covering diagnostics, repair, and modern vehicle technologies including hybrid and electric systems.',
          image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80',
          total_students: 290,
          graduation_rate: 94.1,
          employment_rate: 91.8,
          average_salary: '$68,000',
          industry_partners: 22,
          is_active: true
        }
      ]);
    }
  };

  const refreshSlides = async () => {
    setLoading(true);
    await fetchSlides();
    setLoading(false);
  };

  const refreshTrades = async () => {
    setLoading(true);
    await fetchTrades();
    setLoading(false);
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchSlides(), fetchTrades()]);
      } catch (err) {
        console.error('Error initializing data:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  return (
    <ContentContext.Provider 
      value={{ 
        slides, 
        trades, 
        loading, 
        error, 
        refreshSlides, 
        refreshTrades 
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export default ContentContext;