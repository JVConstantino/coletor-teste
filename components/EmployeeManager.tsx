import React, { useState } from 'react';
import type { Employee } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface EmployeeManagerProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, setEmployees }) => {
  const [showForm, setShowForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', role: '', employeeId: '', email: '', password: '', isAdmin: false });
  const [resettingPasswordFor, setResettingPasswordFor] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Estado para controlar qual colaborador está sendo excluído
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const handleAddEmployee = () => {
    if (newEmployee.name && newEmployee.role && newEmployee.employeeId && newEmployee.email && newEmployee.password) {
      if(employees.some(e => e.employeeId === newEmployee.employeeId)) {
        alert('Já existe um colaborador com esta matrícula.');
        return;
      }
      if(employees.some(e => e.email.toLowerCase() === newEmployee.email.toLowerCase().trim())) {
        alert('Este e-mail já está em uso.');
        return;
      }
      setEmployees(prevEmployees => [...prevEmployees, { ...newEmployee, email: newEmployee.email.trim(), id: Date.now().toString() }]);
      setNewEmployee({ name: '', role: '', employeeId: '', email: '', password: '', isAdmin: false });
      setShowForm(false);
    } else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  const initiateDeleteEmployee = (employee: Employee) => {
    // Security Check: Prevent deleting the last admin
    if (employee.isAdmin) {
      const adminCount = employees.filter(e => e.isAdmin).length;
      if (adminCount <= 1) {
        alert('Não é possível excluir o último administrador do sistema.');
        return; // Stop execution here
      }
    }
    setEmployeeToDelete(employee);
  };

  const confirmDeleteEmployee = () => {
    if (employeeToDelete) {
      setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id));
      setEmployeeToDelete(null);
    }
  };

  const handleOpenResetModal = (employee: Employee) => {
    setResettingPasswordFor(employee);
    setNewPassword('');
  };

  const handleConfirmResetPassword = () => {
    if (resettingPasswordFor && newPassword.trim()) {
      setEmployees(prev => prev.map(e => 
        e.id === resettingPasswordFor.id 
          ? { ...e, password: newPassword.trim() } 
          : e
      ));
      alert('Senha atualizada com sucesso!');
      setResettingPasswordFor(null);
    } else {
      alert('A senha não pode ser vazia.');
    }
  };


  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gerenciar Colaboradores</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="mr-2" />
            {showForm ? 'Cancelar' : 'Novo Colaborador'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-fade-in-down space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
                <input type="text" placeholder="Ex: Maria Santos" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo</label>
                <input type="text" placeholder="Ex: Técnica de Manutenção" value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })} className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Matrícula</label>
                <input type="text" placeholder="Ex: 98765" value={newEmployee.employeeId} onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })} className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <input type="email" placeholder="Ex: maria.santos@email.com" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha Inicial</label>
                <input type="password" placeholder="Defina uma senha" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
                <input type="checkbox" id="isAdmin" checked={newEmployee.isAdmin} onChange={e => setNewEmployee({...newEmployee, isAdmin: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">Tornar este usuário um Administrador</label>
            </div>
            <button onClick={handleAddEmployee} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Adicionar Colaborador
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Lista de Colaboradores</h2>
          
          <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left">
                  <thead className="border-b dark:border-slate-700">
                      <tr>
                          <th className="p-3">Nome / E-mail</th>
                          <th className="p-3">Cargo</th>
                          <th className="p-3">Matrícula</th>
                          <th className="p-3">Nível</th>
                          <th className="p-3">Ações</th>
                      </tr>
                  </thead>
                  <tbody>
                  {employees.length > 0 ? employees.map(e => (
                      <tr key={e.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="p-3">
                            <div className="font-medium">{e.name}</div>
                            <div className="text-xs text-slate-500">{e.email}</div>
                          </td>
                          <td className="p-3">{e.role}</td>
                          <td className="p-3">{e.employeeId}</td>
                          <td className="p-3">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${e.isAdmin ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200'}`}>
                                  {e.isAdmin ? 'Admin' : 'Colaborador'}
                              </span>
                          </td>
                          <td className="p-3">
                              <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleOpenResetModal(e)} 
                                    title="Resetar senha" 
                                    className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/50 dark:hover:bg-yellow-900 transition-colors"
                                >
                                    Resetar Senha
                                </button>
                                <button 
                                    onClick={() => initiateDeleteEmployee(e)} 
                                    title="Excluir colaborador" 
                                    className="flex items-center px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                >
                                    <TrashIcon className="w-3 h-3 mr-1" />
                                    Excluir
                                </button>
                              </div>
                          </td>
                      </tr>
                  )) : (
                      <tr>
                          <td colSpan={5} className="text-center p-4">Nenhum colaborador cadastrado.</td>
                      </tr>
                  )}
                  </tbody>
              </table>
          </div>
          
          <div className="space-y-4 md:hidden">
              {employees.length > 0 ? employees.map(e => (
                  <div key={e.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{e.name}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{e.role}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Matrícula: {e.employeeId}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Email: {e.email}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${e.isAdmin ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200'}`}>
                              {e.isAdmin ? 'Admin' : 'Colaborador'}
                          </span>
                      </div>
                      <div className="border-t dark:border-slate-600 mt-3 pt-3 flex justify-end items-center gap-3">
                          <button 
                            onClick={() => handleOpenResetModal(e)} 
                            className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/50 dark:hover:bg-yellow-900 transition-colors"
                          >
                              Resetar Senha
                          </button>
                          <button 
                            onClick={() => initiateDeleteEmployee(e)} 
                            className="flex items-center px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                          >
                              <TrashIcon className="w-3 h-3 mr-1" />
                              Excluir
                          </button>
                      </div>
                  </div>
              )) : (
                  <p className="text-center p-4">Nenhum colaborador cadastrado.</p>
              )}
          </div>

        </div>
      </div>

      {/* Modal Resetar Senha */}
      {resettingPasswordFor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in px-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-sm">
              <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Resetar Senha</h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                Você está resetando a senha para: <span className="font-semibold">{resettingPasswordFor.name}</span>
              </p>
              <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nova Senha</label>
                  <input 
                      id="new-password"
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" 
                      autoFocus
                  />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                  <button onClick={() => setResettingPasswordFor(null)} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">
                      Cancelar
                  </button>
                  <button onClick={handleConfirmResetPassword} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Salvar Nova Senha
                  </button>
              </div>
          </div>
        </div>
      )}

      {/* Modal Excluir Colaborador */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in px-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-sm">
              <div className="flex flex-col items-center text-center">
                  <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full mb-4">
                    <TrashIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Colaborador?</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                    Você tem certeza que deseja excluir o colaborador <strong>{employeeToDelete.name}</strong>? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3 w-full">
                      <button 
                        onClick={() => setEmployeeToDelete(null)} 
                        className="flex-1 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors"
                      >
                          Cancelar
                      </button>
                      <button 
                        onClick={confirmDeleteEmployee} 
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                      >
                          Excluir
                      </button>
                  </div>
              </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeManager;