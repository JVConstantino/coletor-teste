import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { View, Equipment, Employee, DataCollection, Unit } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EquipmentManager from './components/EquipmentManager';
import EmployeeManager from './components/EmployeeManager';
import DataCollectionList from './components/DataCollectionList';
import DataCollectionForm from './components/DataCollectionForm';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';

function App() {
  const [view, setView] = useState<View>('DASHBOARD');
  const [units, setUnits] = useLocalStorage<Unit[]>('units', []);
  const [equipment, setEquipment] = useLocalStorage<Equipment[]>('equipment', []);
  const [employees, setEmployees] = useLocalStorage<Employee[]>('employees', []);
  const [collections, setCollections] = useLocalStorage<DataCollection[]>('collections', []);
  
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [editingCollection, setEditingCollection] = useState<DataCollection | null>(null);
  const [userForPasswordReset, setUserForPasswordReset] = useState<Employee | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('resetToken');
    if (token) {
        const user = employees.find(
            (e) => e.passwordResetToken?.token === token && e.passwordResetToken.expires > Date.now()
        );
        if (user) {
            setUserForPasswordReset(user);
        } else {
            alert('Token de redefinição de senha inválido ou expirado.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
  }, [employees]);


  const handleLogin = (user: Employee) => {
    setCurrentUser(user);
    setView('DASHBOARD');
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };
  
  const handlePasswordResetSuccess = () => {
    setUserForPasswordReset(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const handleEditCollection = (collection: DataCollection) => {
    setEditingCollection(collection);
    setView('NEW_COLLECTION');
  };

  const handleNewCollection = () => {
    setEditingCollection(null);
    setView('NEW_COLLECTION');
  };

  const handleSaveCollection = (collection: DataCollection) => {
    if (editingCollection) {
      setCollections(collections.map(c => c.id === collection.id ? collection : c));
    } else {
      setCollections([...collections, collection]);
    }
    setEditingCollection(null);
    setView('COLLECTIONS');
  };

  if (userForPasswordReset) {
    return <ResetPassword user={userForPasswordReset} setEmployees={setEmployees} onResetSuccess={handlePasswordResetSuccess} />;
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} employees={employees} setEmployees={setEmployees} />;
  }

  const renderView = () => {
    switch (view) {
      case 'DASHBOARD':
        return <Dashboard unitCount={units.length} equipmentCount={equipment.length} employeeCount={employees.length} collectionCount={collections.length} />;
      case 'EQUIPMENT':
        return <EquipmentManager units={units} setUnits={setUnits} equipment={equipment} setEquipment={setEquipment} collections={collections} />;
      case 'EMPLOYEES':
        // Only admins can see this view
        if (!currentUser.isAdmin) return <Dashboard unitCount={units.length} equipmentCount={equipment.length} employeeCount={employees.length} collectionCount={collections.length} />;
        return <EmployeeManager employees={employees} setEmployees={setEmployees} />;
      case 'COLLECTIONS':
        return <DataCollectionList 
                  collections={collections} 
                  setCollections={setCollections} 
                  equipment={equipment} 
                  employees={employees} 
                  units={units}
                  onEdit={handleEditCollection}
                  onAddNew={handleNewCollection} 
                />;
      case 'NEW_COLLECTION':
        return <DataCollectionForm 
                  units={units}
                  equipment={equipment} 
                  employees={employees} 
                  onSave={handleSaveCollection} 
                  existingCollection={editingCollection}
                  onCancel={() => {
                    setEditingCollection(null);
                    setView('COLLECTIONS');
                  }}
                  currentUser={currentUser}
               />;
      default:
        return <Dashboard unitCount={units.length} equipmentCount={equipment.length} employeeCount={employees.length} collectionCount={collections.length} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Sidebar currentView={view} setView={setView} currentUser={currentUser} onLogout={handleLogout} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
}

export default App;