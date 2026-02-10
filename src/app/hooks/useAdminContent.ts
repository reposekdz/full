import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

interface PageContent {
  id: number;
  page_name: string;
  section_name: string;
  title?: string;
  subtitle?: string;
  content_text?: string;
  content_html?: string;
  image_url?: string;
  background_color?: string;
  text_color?: string;
  font_size?: string;
  is_active: boolean;
  display_order: number;
  updated_at: string;
}

interface UseAdminContentReturn {
  content: PageContent[];
  loading: boolean;
  error: string | null;
  getContent: (pageName: string, sectionName?: string) => PageContent | undefined;
  updateContent: (pageName: string, sectionName: string, data: Partial<PageContent>, image?: File) => Promise<boolean>;
  bulkUpdateContent: (pageName: string, updates: any[], images?: File[]) => Promise<boolean>;
  deleteContent: (pageName: string, sectionName: string) => Promise<boolean>;
  initializePage: (pageName: string) => Promise<boolean>;
  refreshContent: (pageName?: string) => Promise<void>;
}

export const useAdminContent = (pageName?: string): UseAdminContentReturn => {
  const [content, setContent] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async (page?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = page ? `${API_BASE}/admin-content/pages/${page}` : `${API_BASE}/admin-content/pages`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setContent(page ? data.content : data.pages);
      } else {
        setError(data.error || 'Failed to fetch content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(pageName);
  }, [pageName]);

  const getContent = (page: string, section?: string): PageContent | undefined => {
    if (section) {
      return content.find(c => c.page_name === page && c.section_name === section);
    }
    return content.find(c => c.page_name === page);
  };

  const updateContent = async (
    page: string, 
    section: string, 
    data: Partial<PageContent>, 
    image?: File
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      if (image) {
        formData.append('image', image);
      }
      
      const response = await fetch(`${API_BASE}/admin-content/pages/${page}/${section}`, {
        method: 'PUT',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchContent(pageName);
        return true;
      } else {
        setError(result.error || 'Update failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      return false;
    }
  };

  const bulkUpdateContent = async (
    page: string, 
    updates: any[], 
    images?: File[]
  ): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('updates', JSON.stringify(updates));
      
      if (images) {
        images.forEach((image, index) => {
          formData.append(`image_${updates[index]?.section_name}`, image);
        });
      }
      
      const response = await fetch(`${API_BASE}/admin-content/pages/${page}/bulk`, {
        method: 'PUT',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchContent(pageName);
        return true;
      } else {
        setError(result.error || 'Bulk update failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk update failed');
      return false;
    }
  };

  const deleteContent = async (page: string, section: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/admin-content/pages/${page}/${section}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchContent(pageName);
        return true;
      } else {
        setError(result.error || 'Delete failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      return false;
    }
  };

  const initializePage = async (page: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/admin-content/pages/${page}/initialize`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchContent(pageName);
        return true;
      } else {
        setError(result.error || 'Initialization failed');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Initialization failed');
      return false;
    }
  };

  const refreshContent = async (page?: string) => {
    await fetchContent(page || pageName);
  };

  return {
    content,
    loading,
    error,
    getContent,
    updateContent,
    bulkUpdateContent,
    deleteContent,
    initializePage,
    refreshContent
  };
};

// Helper hook for getting specific content with fallback
export const usePageContent = (pageName: string, sectionName: string, fallback: string = '') => {
  const { getContent } = useAdminContent(pageName);
  const content = getContent(pageName, sectionName);
  
  return {
    text: content?.content_text || fallback,
    html: content?.content_html || '',
    title: content?.title || '',
    subtitle: content?.subtitle || '',
    image: content?.image_url || '',
    backgroundColor: content?.background_color || '',
    textColor: content?.text_color || '',
    fontSize: content?.font_size || ''
  };
};