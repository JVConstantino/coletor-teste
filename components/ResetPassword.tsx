import React, { useState } from 'react';
import type { Employee } from '../types';

interface ResetPasswordProps {
    user: Employee;
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
    onResetSuccess: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ user, setEmployees, onResetSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        
        setEmployees(prev => prev.map(emp => {
            if (emp.id === user.id) {
                const { passwordResetToken, ...rest } = emp;
                return { ...rest, password };
            }
            return emp;
        }));
        
        setMessage('Sua senha foi redefinida com sucesso! Você será redirecionado para a tela de login.');
        setTimeout(() => {
            onResetSuccess();
        }, 3000);
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-slate-800">
                <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">Redefinir Senha</h2>
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Crie uma nova senha para <span className="font-semibold">{user.name}</span>.
                </p>
                {message ? (
                    <p className="p-4 text-center text-green-800 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-200">{message}</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nova Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="w-full p-2 mt-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                className="w-full p-2 mt-1 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            Salvar Nova Senha
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;