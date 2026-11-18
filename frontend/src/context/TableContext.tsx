import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Table } from '../types/index.js';
import { getTableDetails } from '../services/api.js';

interface TableContextType {
  tableId: string | null;
  tableDetails: Table | null;
  setTableId: (id: string | null) => void;
  clearTable: () => void;
  refreshTable: () => Promise<void>;
  isLoadingTable: boolean;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tableId, setTableIdState] = useState<string | null>(() => {
    return localStorage.getItem('bb_table_id');
  });
  const [tableDetails, setTableDetails] = useState<Table | null>(null);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);

  const setTableId = useCallback((id: string | null) => {
    if (id) {
      const formatted = id.padStart(2, '0');
      setTableIdState(formatted);
      localStorage.setItem('bb_table_id', formatted);
    } else {
      setTableIdState(null);
      localStorage.removeItem('bb_table_id');
      setTableDetails(null);
    }
  }, []);

  const clearTable = useCallback(() => {
    setTableId(null);
  }, [setTableId]);

  const refreshTable = useCallback(async () => {
    if (!tableId) {
      setTableDetails(null);
      return;
    }
    setIsLoadingTable(true);
    try {
      const data = await getTableDetails(tableId);
      setTableDetails(data.table);
    } catch (err) {
      console.error('[TableContext] Error loading table:', err);
    } finally {
      setIsLoadingTable(false);
    }
  }, [tableId]);

  useEffect(() => {
    refreshTable();
  }, [refreshTable]);

  return (
    <TableContext.Provider
      value={{
        tableId,
        tableDetails,
        setTableId,
        clearTable,
        refreshTable,
        isLoadingTable,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) throw new Error('useTable must be used within TableProvider');
  return context;
};
