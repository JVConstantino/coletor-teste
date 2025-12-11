
import React, { useState, useMemo } from 'react';
import type { DataCollection, Equipment, Employee, Unit } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import EmailIcon from './icons/EmailIcon';

interface DataCollectionListProps {
  collections: DataCollection[];
  setCollections: React.Dispatch<React.SetStateAction<DataCollection[]>>;
  equipment: Equipment[];
  employees: Employee[];
  units: Unit[];
  onEdit: (collection: DataCollection) => void;
  onAddNew: () => void;
}

const DataCollectionList: React.FC<DataCollectionListProps> = ({ collections, setCollections, equipment, employees, units, onEdit, onAddNew }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Estados para os modais de confirmação
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

  const processedCollections = useMemo(() => {
    // Explicitly type the Maps to ensure correct type inference for their values.
    const equipmentMap = new Map<string, Equipment>(equipment.map(e => [e.id, e]));
    const employeeMap = new Map<string, string>(employees.map(e => [e.id, e.name]));
    const unitMap = new Map<string, string>(units.map(u => [u.id, u.name]));

    return [...collections].reverse().map(c => {
      const eq = equipmentMap.get(c.equipmentId);
      const employeeName = employeeMap.get(c.employeeId) || 'Desconhecido';
      const unitName = eq ? unitMap.get(eq.unitId) || 'Unidade Desconhecida' : 'Unidade Desconhecida';
      const equipmentName = eq ? eq.name : 'Equipamento Desconhecido';
      
      return {
        ...c,
        employeeName,
        unitName,
        equipmentName
      };
    });
  }, [collections, equipment, employees, units]);

  // Função chamada ao confirmar a exclusão de UMA coleta
  const confirmDeleteCollection = () => {
    if (collectionToDelete) {
      setCollections(prevCollections => prevCollections.filter(c => c.id !== collectionToDelete));
      setCollectionToDelete(null);
    }
  };

  // Função chamada ao confirmar a exclusão de TODO o histórico
  const confirmClearHistory = () => {
    setCollections([]);
    setShowClearHistoryModal(false);
  };

  const handleEmail = (collection: typeof processedCollections[0]) => {
    let customFieldsBody = '';
    if (collection.customFieldValues && Object.keys(collection.customFieldValues).length > 0) {
      customFieldsBody = '\nMedições Específicas:\n';
      for (const [key, value] of Object.entries(collection.customFieldValues)) {
        customFieldsBody += `- ${key}: ${value}\n`;
      }
    }
    
    const subject = `Relatório de Manutenção Preditiva - ${collection.unitName} / ${collection.equipmentName} - ${new Date(collection.date).toLocaleDateString()}`;
    const body = `
Relatório de Coleta de Dados de Manutenção Preditiva
--------------------------------------------------

Equipamento: ${collection.unitName} / ${collection.equipmentName}
Colaborador: ${collection.employeeName}
Data da Coleta: ${new Date(collection.date).toLocaleString()}

Dados Coletados:
- Vibração: ${collection.vibration}
- Temperatura: ${collection.temperature} °C
- Pressão: ${collection.pressure} bar
${customFieldsBody}
Observações:
${collection.notes}

--------------------------------------------------
Relatório gerado pelo App de Coleta Preditiva.
    `.trim();

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };
  
  const handleSendDailyReport = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysCollections = processedCollections.filter(c => {
      const collectionDate = new Date(c.date);
      return collectionDate >= today && collectionDate < tomorrow;
    });

    if (todaysCollections.length === 0) {
      alert('Nenhuma coleta encontrada para o dia de hoje.');
      return;
    }

    let emailBody = `Relatório Consolidado de Coletas de Manutenção Preditiva
Data: ${today.toLocaleDateString()}
--------------------------------------------------\n\n`;

    todaysCollections.forEach((collection, index) => {
      let customFieldsBody = '';
      if (collection.customFieldValues && Object.keys(collection.customFieldValues).length > 0) {
        customFieldsBody = '\n  Medições Específicas:\n';
        for (const [key, value] of Object.entries(collection.customFieldValues)) {
          customFieldsBody += `  - ${key}: ${value}\n`;
        }
      }

      emailBody += `## COLETA ${index + 1} ##\n\nEquipamento: ${collection.unitName} / ${collection.equipmentName}\nColaborador: ${collection.employeeName}\nData da Coleta: ${new Date(collection.date).toLocaleString()}\n\nDados Coletados:\n- Vibração: ${collection.vibration}\n- Temperatura: ${collection.temperature} °C\n- Pressão: ${collection.pressure} bar\n${customFieldsBody.trim()}\n\nObservações:\n${collection.notes || 'Nenhuma'}\n--------------------------------------------------\n\n`;
    });
    
    emailBody += `Relatório gerado pelo App de Coleta Preditiva.`;

    const subject = `Relatório Diário de Coletas - ${today.toLocaleDateString()}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Coletas de Dados</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleSendDailyReport}
            className="flex items-center justify-center bg-teal-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-teal-700 transition-colors"
            title="Agrupa todas as coletas de hoje em um único e-mail"
          >
            <EmailIcon className="mr-2 h-5 w-5" />
            Enviar Relatório do Dia
          </button>
          <button
            onClick={() => setShowClearHistoryModal(true)}
            disabled={collections.length === 0}
            className={`flex items-center justify-center px-4 py-2 rounded-lg shadow-md transition-colors ${
                collections.length === 0 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title="Apaga permanentemente todo o histórico de coletas"
          >
            <TrashIcon className="mr-2 h-5 w-5" />
            Apagar Histórico
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Histórico de Coletas</h2>
        <div className="space-y-4">
          {processedCollections.length > 0 ? processedCollections.map(c => {
            return (
              <div key={c.id} className="border rounded-lg dark:border-slate-700 overflow-hidden">
                <div
                  className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  title={expandedId === c.id ? 'Recolher detalhes' : 'Ver detalhes'}
                >
                  <div>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">{c.unitName} / {c.equipmentName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(c.date).toLocaleString()} por {c.employeeName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0 self-end sm:self-center">
                    <button onClick={(e) => { e.stopPropagation(); handleEmail(c); }} title="Enviar coleta por e-mail" className="p-2 text-slate-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"><EmailIcon /></button>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(c); }} title="Editar esta coleta" className="p-2 text-slate-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCollectionToDelete(c.id); }} 
                      title="Excluir esta coleta" 
                      className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <TrashIcon />
                    </button>
                    <svg className={`w-5 h-5 transition-transform ${expandedId === c.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {expandedId === c.id && (
                  <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 animate-fade-in-down space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                          <div>
                              <strong className="block text-xs font-medium text-slate-500 dark:text-slate-400">Vibração</strong>
                              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{c.vibration}</p>
                          </div>
                          <div>
                              <strong className="block text-xs font-medium text-slate-500 dark:text-slate-400">Temperatura</strong>
                              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{c.temperature} °C</p>
                          </div>
                          <div>
                              <strong className="block text-xs font-medium text-slate-500 dark:text-slate-400">Pressão</strong>
                              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{c.pressure} bar</p>
                          </div>
                      </div>
                      {c.customFieldValues && Object.keys(c.customFieldValues).length > 0 && (
                          <div className="border-t dark:border-slate-700 pt-4">
                            <strong className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Medições Específicas:</strong>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                                {Object.entries(c.customFieldValues).map(([key, value]) => (
                                     <div key={key}>
                                        <strong className="block text-xs font-medium text-slate-500 dark:text-slate-400">{key}</strong>
                                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{value}</p>
                                    </div>
                                ))}
                             </div>
                          </div>
                      )}
                      <div>
                          <strong className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observações:</strong>
                          <p className="mt-1 whitespace-pre-wrap text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 p-2 rounded">{c.notes || 'Nenhuma'}</p>

                      </div>
                      {c.photo && (
                           <div>
                              <strong className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Foto:</strong>
                              <img src={c.photo} alt="Foto da coleta" className="max-w-xs md:max-w-sm rounded-lg shadow-lg" />
                          </div>
                      )}
                  </div>
                )}
              </div>
            )
          }) : (
            <p className="text-center p-4">Nenhuma coleta de dados registrada.</p>
          )}
        </div>
      </div>
       <button
        onClick={onAddNew}
        aria-label="Adicionar nova coleta"
        title="Adicionar nova coleta"
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform hover:scale-110"
      >
        <PlusIcon />
      </button>

      {/* Modal de Confirmação para Apagar Histórico */}
      {showClearHistoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full mb-4">
                <TrashIcon className="h-8 w-8 text-red-600 dark:text-red-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Apagar Todo o Histórico?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                Você está prestes a excluir permanentemente <strong>TODAS</strong> as coletas registradas. Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setShowClearHistoryModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmClearHistory}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Apagar Tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Excluir Coleta Individual */}
      {collectionToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Coleta?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Tem certeza que deseja excluir esta coleta de dados?
            </p>
            <div className="flex justify-end gap-3">
               <button
                  onClick={() => setCollectionToDelete(null)}
                  className="px-4 py-2 text-sm bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteCollection}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Excluir
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DataCollectionList;
