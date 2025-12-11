import React, { useState } from 'react';
import type { Employee } from '../types';

interface LoginProps {
  onLogin: (user: Employee) => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const Login: React.FC<LoginProps> = ({ onLogin, employees, setEmployees }) => {
  const isFirstRun = employees.length === 0;
  const [mode, setMode] = useState<'login' | 'createAdmin' | 'create' | 'forgotPassword'>(isFirstRun ? 'createAdmin' : 'login');
  
  const [loginData, setLoginData] = useState({ employeeId: '', password: ''});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [newUser, setNewUser] = useState({ name: '', role: '', employeeId: '', email: '', password: '', isAdmin: false });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = employees.find(emp => emp.employeeId === loginData.employeeId);
    if (user && user.password === loginData.password) {
      onLogin(user);
    } else {
      setError('Matrícula ou senha inválida.');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (employees.some(emp => emp.employeeId === newUser.employeeId)) {
        setError('Esta matrícula já está em uso.');
        return;
    }
    if (employees.some(emp => emp.email.toLowerCase() === newUser.email.toLowerCase().trim())) {
        setError('Este e-mail já está em uso.');
        return;
    }

    const userToCreate = { ...newUser, id: Date.now().toString(), email: newUser.email.trim() };
    setEmployees(prev => [...prev, userToCreate]);
    onLogin(userToCreate);
  };
  
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const user = employees.find(emp => emp.email.toLowerCase() === forgotPasswordEmail.toLowerCase().trim());

    if (user) {
        const token = Math.random().toString(36).substr(2);
        const expires = Date.now() + 15 * 60 * 1000; // 15 minutes
        
        const updatedUser = { ...user, passwordResetToken: { token, expires }};
        setEmployees(prev => prev.map(e => e.id === user.id ? updatedUser : e));
        
        const resetLink = `${window.location.origin}${window.location.pathname}?resetToken=${token}`;
        
        const subject = "Redefinição de Senha - App Preditiva";
        const body = `Olá ${user.name},\n\nVocê solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova senha. Este link é válido por 15 minutos.\n\n${resetLink}\n\nSe você não solicitou isso, por favor, ignore este e-mail.`;
        
        window.location.href = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    // Show the same message whether the email exists or not for security
    setMessage('Se um usuário com este e-mail existir, um link de redefinição de senha será enviado.');
    setForgotPasswordEmail('');
  }


  const renderForm = () => {
    switch (mode) {
      case 'createAdmin':
      case 'create':
        const isAdminSetup = mode === 'createAdmin';
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">{isAdminSetup ? "Criar Conta de Administrador" : "Criar Nova Conta"}</h2>
            {isAdminSetup && <p className="text-center text-sm text-slate-600 dark:text-slate-400">Este será o primeiro usuário do sistema.</p>}
            <form onSubmit={handleCreateUser} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required className="w-full p-2 mt-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              {!isAdminSetup && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cargo</label>
                  <input type="text" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} required className="w-full p-2 mt-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
                </div>
              )}
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required className="w-full p-2 mt-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Matrícula</label>
                <input type="text" value={newUser.employeeId} onChange={e => setNewUser({...newUser, employeeId: e.target.value})} required className="w-full p-2 mt-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value, isAdmin: isAdminSetup, role: isAdminSetup ? 'Administrador' : newUser.role })} required className="w-full p-2 mt-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">{isAdminSetup ? "Criar Administrador" : "Criar Conta"}</button>
            </form>
             {!isAdminSetup && <p className="text-xs text-center text-slate-500">Já tem uma conta? <button onClick={() => setMode('login')} className="font-medium text-blue-600 hover:underline">Entrar</button></p>}
          </>
        );
      case 'forgotPassword':
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Recuperar Senha</h2>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">Digite seu e-mail para receber um link de redefinição de senha.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
                <input type="email" value={forgotPasswordEmail} onChange={e => setForgotPasswordEmail(e.target.value)} required className="w-full p-2 mt-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              {message && <p className="text-sm text-green-600">{message}</p>}
              <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Enviar Link</button>
            </form>
            <p className="text-xs text-center text-slate-500">Lembrou a senha? <button onClick={() => setMode('login')} className="font-medium text-blue-600 hover:underline">Voltar para o Login</button></p>
          </>
        );
      case 'login':
      default:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Matrícula</label>
                <input type="text" value={loginData.employeeId} onChange={e => setLoginData({...loginData, employeeId: e.target.value})} required className="w-full p-2 mt-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
                <input type="password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required className="w-full p-2 mt-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="text-right text-xs">
                  <button type="button" onClick={() => setMode('forgotPassword')} className="font-medium text-blue-600 hover:underline">Esqueceu a senha?</button>
              </div>
              <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Entrar</button>
            </form>
            <p className="text-xs text-center text-slate-500">Não tem uma conta? <button onClick={() => setMode('create')} className="font-medium text-blue-600 hover:underline">Crie uma aqui</button></p>
          </>
        );
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-slate-800">
        <div className="flex justify-center">
            <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"></path>
            </svg>
        </div>
        {renderForm()}
      </div>
    </div>
  );
};

export default Login;