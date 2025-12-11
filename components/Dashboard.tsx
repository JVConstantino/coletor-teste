import React from 'react';
import EquipmentIcon from './icons/EquipmentIcon';
import EmployeeIcon from './icons/EmployeeIcon';
import CollectionIcon from './icons/CollectionIcon';
import UnitIcon from './icons/UnitIcon';

interface DashboardProps {
  unitCount: number;
  equipmentCount: number;
  employeeCount: number;
  collectionCount: number;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; color: string }> = ({ icon, title, value, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform hover:scale-105">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);


const Dashboard: React.FC<DashboardProps> = ({ unitCount, equipmentCount, employeeCount, collectionCount }) => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<UnitIcon className="text-white" />} title="Unidades Cadastradas" value={unitCount} color="bg-indigo-500" />
        <StatCard icon={<EquipmentIcon className="text-white" />} title="Equipamentos Cadastrados" value={equipmentCount} color="bg-blue-500" />
        <StatCard icon={<EmployeeIcon className="text-white" />} title="Colaboradores Registrados" value={employeeCount} color="bg-green-500" />
        <StatCard icon={<CollectionIcon className="text-white" />} title="Coletas Realizadas" value={collectionCount} color="bg-purple-500" />
      </div>
       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Bem-vindo ao Coletor de Manutenção Preditiva</h2>
            <p className="text-slate-600 dark:text-slate-300">
                Utilize o menu à esquerda para navegar entre as seções. Você pode cadastrar novas unidades, adicionar equipamentos a elas,
                e registrar as coletas de dados de manutenção. Todos os dados são salvos localmente no seu navegador.
            </p>
        </div>
    </div>
  );
};

export default Dashboard;
