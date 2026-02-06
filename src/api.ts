// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface GuildData {
  pts: any[];
  guerreiros: any[];
  premios: any[];
  classes: any[];
  batalhas: any[];
}

// Fetch all guild data
export async function fetchGuildData(): Promise<GuildData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/guild-data`);
    if (!response.ok) throw new Error('Failed to fetch data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching guild data:', error);
    // Return empty data if API fails
    return { pts: [], guerreiros: [], premios: [], classes: [], batalhas: [] };
  }
}

// Save all guild data
export async function saveGuildData(data: GuildData): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/guild-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving guild data:', error);
    return false;
  }
}

// Add item to a collection
export async function addItem(type: string, item: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/guild-data/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Failed to add item');
    const result = await response.json();
    return result.item;
  } catch (error) {
    console.error('Error adding item:', error);
    return null;
  }
}

// Update item
export async function updateItem(type: string, id: string, updates: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/guild-data/${type}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update item');
    const result = await response.json();
    return result.item;
  } catch (error) {
    console.error('Error updating item:', error);
    return null;
  }
}

// Delete item
export async function deleteItem(type: string, id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/guild-data/${type}/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting item:', error);
    return false;
  }
}

// Setup auto-sync with polling
export function setupAutoSync(
  onDataUpdate: (data: GuildData) => void,
  intervalMs: number = 5000
): () => void {
  const interval = setInterval(async () => {
    const data = await fetchGuildData();
    onDataUpdate(data);
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
}
