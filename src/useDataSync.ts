import { useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useDataSync = (
  data: any,
  onDataChange: (newData: any) => void,
  isLoggedIn: boolean
) => {
  // Carregar dados do servidor ao montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/data`);
        if (response.ok) {
          const serverData = await response.json();
          onDataChange(serverData);
        }
      } catch (error) {
        console.log('Usando dados locais (servidor indisponível)');
      }
    };

    loadData();
    
    // Sincronizar a cada 5 segundos
    const interval = setInterval(loadData, 5000);
    
    return () => clearInterval(interval);
  }, [onDataChange]);

  // Salvar dados no servidor quando mudam
  const syncData = useCallback(async (newData: any) => {
    if (!isLoggedIn) return; // Não sincroniza se não logado

    try {
      const response = await fetch(`${API_URL}/api/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        console.error('Erro ao sincronizar dados');
      }
    } catch (error) {
      console.log('Erro de conexão - dados salvos localmente');
      // Os dados continuam salvos no localStorage como fallback
    }
  }, [isLoggedIn]);

  return { syncData };
};
