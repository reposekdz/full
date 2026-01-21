const API_BASE = 'http://localhost:5000/api';

export interface Team {
  id: number;
  name: string;
  role: string;
  head_name: string;
  team_size: number;
  description?: string;
  responsibilities?: string[];
  image_url?: string;
  avatar_emoji?: string;
  color_gradient?: string;
  is_active: boolean;
  sort_order: number;
}

class TeamsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAllTeams(): Promise<Team[]> {
    const response = await fetch(`${API_BASE}/teams`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.teams;
  }

  async getTeamById(id: number): Promise<Team> {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.team;
  }

  async createTeam(teamData: Partial<Team>): Promise<Team> {
    const response = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(teamData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.team;
  }

  async updateTeam(id: number, teamData: Partial<Team>): Promise<Team> {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(teamData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.team;
  }

  async deleteTeam(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
  }
}

export default new TeamsService();
