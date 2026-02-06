// Storage Sync - Sincroniza dados entre abas do navegador
// Quando um usuário faz uma alteração em uma aba, todas as outras abas recebem a atualização

import React from 'react';

export interface StorageSyncListener {
  (key: string, newValue: any, oldValue: any): void;
}

class StorageSync {
  private listeners: Map<string, Set<StorageSyncListener>> = new Map();

  constructor() {
    // Escuta eventos de storage de outras abas
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key) {
        const newValue = event.newValue ? JSON.parse(event.newValue) : null;
        const oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
        this.notifyListeners(event.key, newValue, oldValue);
      }
    });
  }

  /**
   * Registra um listener para mudanças em uma chave
   */
  subscribe(key: string, listener: StorageSyncListener): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // Retorna função para desinscrever
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  /**
   * Notifica todos os listeners de uma chave
   */
  private notifyListeners(key: string, newValue: any, oldValue: any) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(key, newValue, oldValue);
        } catch (error) {
          console.error('Error in storage sync listener:', error);
        }
      });
    }
  }

  /**
   * Salva um valor no localStorage e notifica outras abas
   */
  setItem(key: string, value: any): void {
    const oldValue = this.getItem(key);
    localStorage.setItem(key, JSON.stringify(value));
    this.notifyListeners(key, value, oldValue);
  }

  /**
   * Obtém um valor do localStorage
   */
  getItem(key: string): any {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Remove um valor do localStorage
   */
  removeItem(key: string): void {
    const oldValue = this.getItem(key);
    localStorage.removeItem(key);
    this.notifyListeners(key, null, oldValue);
  }

  /**
   * Limpa tudo do localStorage
   */
  clear(): void {
    localStorage.clear();
  }
}

// Exporta instância única
export const storageSync = new StorageSync();

/**
 * Hook para usar storage sync em componentes React
 */
export function useStorageSync<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = React.useState<T>(() => {
    const stored = storageSync.getItem(key);
    return stored !== null ? stored : initialValue;
  });

  React.useEffect(() => {
    // Escuta mudanças de outras abas
    const unsubscribe = storageSync.subscribe(key, (_, newValue) => {
      setValue(newValue !== null ? newValue : initialValue);
    });

    return unsubscribe;
  }, [key, initialValue]);

  const setValue_sync = (newValue: T) => {
    setValue(newValue);
    storageSync.setItem(key, newValue);
  };

  return [value, setValue_sync];
}

export default storageSync;
