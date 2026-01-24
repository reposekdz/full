import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Settings, Save, RefreshCw, Palette, Sliders } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dynamic-system';

export default function DynamicConfigAdmin() {
  const [config, setConfig] = useState<any>({});
  const [theme, setTheme] = useState<any>({});
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [configRes, themeRes, widgetsRes] = await Promise.all([
        axios.get(`${API_URL}/config`, { headers }),
        axios.get(`${API_URL}/theme`, { headers }),
        axios.get(`${API_URL}/widgets`, { headers })
      ]);
      
      setConfig(configRes.data.config || {});
      setTheme(themeRes.data.theme || {});
      setWidgets(widgetsRes.data.widgets || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key: string, value: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/config/${key}`, { value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Configuration updated successfully!');
      fetchData();
    } catch (error) {
      alert('Error updating configuration');
    }
  };

  const updateTheme = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/theme`, theme, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Theme updated successfully!');
    } catch (error) {
      alert('Error updating theme');
    }
  };

  const updateWidget = async (id: number, updates: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/widgets/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Widget updated successfully!');
      fetchData();
    } catch (error) {
      alert('Error updating widget');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="text-xl">Loading...</div></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Dynamic System Configuration
        </h1>
        <Button onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dashboard Refresh Interval (ms)</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={config.dashboard_refresh_interval || 30000}
                onChange={(e) => setConfig({...config, dashboard_refresh_interval: e.target.value})}
              />
              <Button size="sm" className="mt-2" onClick={() => updateConfig('dashboard_refresh_interval', config.dashboard_refresh_interval)}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Academic Year</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={config.academic_year || '2024'}
                onChange={(e) => setConfig({...config, academic_year: e.target.value})}
              />
              <Button size="sm" className="mt-2" onClick={() => updateConfig('academic_year', config.academic_year)}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Semester</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={config.semester || '1'}
                onChange={(e) => setConfig({...config, semester: e.target.value})}
              />
              <Button size="sm" className="mt-2" onClick={() => updateConfig('semester', config.semester)}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={config.currency || 'RWF'}
                onChange={(e) => setConfig({...config, currency: e.target.value})}
              />
              <Button size="sm" className="mt-2" onClick={() => updateConfig('currency', config.currency)}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Students Per Class</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={config.max_students_per_class || 40}
                onChange={(e) => setConfig({...config, max_students_per_class: e.target.value})}
              />
              <Button size="sm" className="mt-2" onClick={() => updateConfig('max_students_per_class', config.max_students_per_class)}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Theme Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">School Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={theme.school_name || ''}
                onChange={(e) => setTheme({...theme, school_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="w-20 h-10 border rounded"
                  value={theme.primary_color || '#3B82F6'}
                  onChange={(e) => setTheme({...theme, primary_color: e.target.value})}
                />
                <input
                  type="text"
                  className="flex-1 border p-2 rounded"
                  value={theme.primary_color || '#3B82F6'}
                  onChange={(e) => setTheme({...theme, primary_color: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="w-20 h-10 border rounded"
                  value={theme.secondary_color || '#10B981'}
                  onChange={(e) => setTheme({...theme, secondary_color: e.target.value})}
                />
                <input
                  type="text"
                  className="flex-1 border p-2 rounded"
                  value={theme.secondary_color || '#10B981'}
                  onChange={(e) => setTheme({...theme, secondary_color: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Accent Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="w-20 h-10 border rounded"
                  value={theme.accent_color || '#F59E0B'}
                  onChange={(e) => setTheme({...theme, accent_color: e.target.value})}
                />
                <input
                  type="text"
                  className="flex-1 border p-2 rounded"
                  value={theme.accent_color || '#F59E0B'}
                  onChange={(e) => setTheme({...theme, accent_color: e.target.value})}
                />
              </div>
            </div>
          </div>
          <Button className="mt-4" onClick={updateTheme}>
            <Save className="w-4 h-4 mr-2" />
            Save Theme
          </Button>
        </CardContent>
      </Card>

      {/* Widgets Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Widgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {widgets.map(widget => (
              <div key={widget.id} className="flex items-center gap-4 p-4 border rounded">
                <div className="flex-1">
                  <h4 className="font-bold">{widget.title}</h4>
                  <p className="text-sm text-gray-600">Order: {widget.display_order}</p>
                </div>
                <select
                  className="border p-2 rounded"
                  value={widget.status}
                  onChange={(e) => updateWidget(widget.id, { ...widget, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
