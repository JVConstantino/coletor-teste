import React, { useState } from 'react';
import type { View, Employee } from '../types';
import DashboardIcon from './icons/DashboardIcon';
import EquipmentIcon from './icons/EquipmentIcon';
import EmployeeIcon from './icons/EmployeeIcon';
import CollectionIcon from './icons/CollectionIcon';
import PlusIcon from './icons/PlusIcon';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  currentUser: Employee;
  onLogout: () => void;
}

const NavItem: React.FC<{
  view: View;
  currentView: View;
  setView: (view: View) => void;
  icon: React.ReactNode;
  label: string;
}> = ({ view, currentView, setView, icon, label }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => setView(view)}
      title={label}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      <span className="ml-3 block sm:hidden lg:block">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSetView = (view: View) => {
    setView(view);
    setIsOpen(false);
  };


  return (
    <>
      {/* Mobile Menu Button */}
      <button className="sm:hidden fixed top-4 left-4 z-30 p-2 bg-slate-200 dark:bg-slate-800 rounded-md" onClick={() => setIsOpen(!isOpen)} title={isOpen ? "Fechar menu" : "Abrir menu"}>
        <svg xmlns="http://www.w.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 sm:hidden" onClick={() => setIsOpen(false)}></div>}

      <aside className={`fixed sm:relative z-30 sm:z-auto inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 transition-transform duration-300 ease-in-out bg-white dark:bg-slate-800 shadow-lg w-64 sm:w-20 lg:w-64 flex flex-col p-4`}>
        <div className="flex items-center justify-center lg:justify-start mb-8 h-12">
          <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"></path>
          </svg>
          <h1 className="ml-3 text-2xl font-bold text-slate-800 dark:text-white block sm:hidden lg:block">Preditiva</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem view="DASHBOARD" currentView={currentView} setView={handleSetView} icon={<DashboardIcon />} label="Dashboard" />
          <NavItem view="EQUIPMENT" currentView={currentView} setView={handleSetView} icon={<EquipmentIcon />} label="Equipamentos" />
          {currentUser.isAdmin && (
            <NavItem view="EMPLOYEES" currentView={currentView} setView={handleSetView} icon={<EmployeeIcon />} label="Colaboradores" />
          )}
          <NavItem view="COLLECTIONS" currentView={currentView} setView={handleSetView} icon={<CollectionIcon />} label="Coletas" />
        </nav>
        <div className="mt-auto space-y-4">
           <div className="text-center sm:text-left pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold truncate block sm:hidden lg:block" title={currentUser.name}>{currentUser.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 block sm:hidden lg:block">{currentUser.role}</p>
              <button onClick={onLogout} className="w-full text-center mt-2 text-sm text-red-500 hover:underline">
                <span className="block sm:hidden lg:block">Sair</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto hidden sm:block lg:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
           </div>
          <button
            onClick={() => handleSetView('NEW_COLLECTION')}
            title="Iniciar uma nova coleta de dados"
            className="flex items-center justify-center w-full bg-green-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-6 w-6" />
            <span className="ml-3 block sm:hidden lg:block">Nova Coleta</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;