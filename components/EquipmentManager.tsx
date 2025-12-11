import React, { useState } from 'react';
import type { Equipment, Unit, DataCollection } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import ChartIcon from './icons/ChartIcon';
import MeasurementChart from './MeasurementChart';

interface EquipmentManagerProps {
  units: Unit[];
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  collections: DataCollection[];
}

const equipmentTypeTemplates = {
  'Motor Elétrico': [
    { name: 'Corrente', unit: 'A' },
    { name: 'Tensão', unit: 'V' },
    { name: 'Rotação', unit: 'RPM' },
  ],
  'Bomba Centrífuga': [
    { name: 'Vazão', unit: 'm³/h' },
    { name: 'Pressão de Sucção', unit: 'bar' },
    { name: 'Pressão de Descarga', unit: 'bar' },
  ],
  'Painel Elétrico': [
    { name: 'Tensão de Entrada', unit: 'V' },
    { name: 'Tensão de Saída', unit: 'V' },
    { name: 'Temperatura Interna', unit: '°C' },
  ],
};

const EquipmentManager: React.FC<EquipmentManagerProps> = ({ units, setUnits, equipment, setEquipment, collections }) => {
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');

  const [addingEquipmentToUnit, setAddingEquipmentToUnit] = useState<string | null>(null);
  const [newEquipment, setNewEquipment] = useState({ 
    name: '', 
    type: '', 
    serialNumber: '', 
    model: '', 
    manufacturer: '', 
    installationDate: '', 
    criticality: 'Medium' as 'High' | 'Medium' | 'Low',
    customFields: [] as { name: string; unit: string }[]
  });

  const [newCustomFieldName, setNewCustomFieldName] = useState('');
  const [newCustomFieldUnit, setNewCustomFieldUnit] = useState('');
  
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [chartVisibleForEquipmentId, setChartVisibleForEquipmentId] = useState<string | null>(null);

  const handleAddUnit = () => {
    if (newUnitName.trim()) {
      setUnits(prevUnits => [...prevUnits, { id: Date.now().toString(), name: newUnitName.trim() }]);
      setNewUnitName('');
      setShowUnitForm(false);
    }
  };

  const handleDeleteUnit = (unitId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade? TODOS os equipamentos associados a ela também serão excluídos.')) {
      setUnits(prevUnits => prevUnits.filter(u => u.id !== unitId));
      setEquipment(prevEquipment => prevEquipment.filter(e => e.unitId !== unitId));
    }
  };
  
  const handleAddEquipment = (unitId: string) => {
    if (newEquipment.name && newEquipment.type && newEquipment.serialNumber) {
      setEquipment(prevEquipment => [...prevEquipment, { ...newEquipment, id: Date.now().toString(), unitId }]);
      setNewEquipment({ name: '', type: '', serialNumber: '', model: '', manufacturer: '', installationDate: '', criticality: 'Medium', customFields: [] });
      setAddingEquipmentToUnit(null);
    }
  };
  
  const handleDeleteEquipment = (id: string) => {
    if(window.confirm('Tem certeza que deseja excluir este equipamento?')) {
       setEquipment(prevEquipment => prevEquipment.filter(e => e.id !== id));
    }
  };

  const handleAddCustomField = () => {
    if (newCustomFieldName.trim()) {
      setNewEquipment(prev => ({
        ...prev,
        customFields: [...prev.customFields, { name: newCustomFieldName.trim(), unit: newCustomFieldUnit.trim() }]
      }));
      setNewCustomFieldName('');
      setNewCustomFieldUnit('');
    }
  };
  
  const handleRemoveCustomField = (index: number) => {
    setNewEquipment(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    const templateFields = equipmentTypeTemplates[selectedType as keyof typeof equipmentTypeTemplates] || [];
    
    if (newEquipment.customFields.length > 0 && templateFields.length > 0) {
      if (!window.confirm('Alterar o tipo do equipamento substituirá os campos de medição personalizados atuais. Deseja continuar?')) {
        e.target.value = newEquipment.type; // Revert selection if user cancels
        return;
      }
    }

    setNewEquipment(prev => ({ 
        ...prev, 
        type: selectedType, 
        customFields: templateFields 
    }));
  };

  
  const criticalityClasses = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Unidades e Equipamentos</h1>
        <button
          onClick={() => setShowUnitForm(!showUnitForm)}
          title="Adicionar uma nova unidade para agrupar equipamentos"
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="mr-2" />
          {showUnitForm ? 'Cancelar' : 'Nova Unidade'}
        </button>
      </div>

      {showUnitForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md animate-fade-in-down">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Unidade</label>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Ex: Bloco A, Linha de Produção 1"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
            />
            <button onClick={handleAddUnit} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Lista de Unidades</h2>
        <div className="space-y-4">
          {units.length > 0 ? units.map(unit => {
            const unitEquipment = equipment.filter(e => e.unitId === unit.id);
            const isExpanded = expandedUnitId === unit.id;

            return (
              <div key={unit.id} className="border rounded-lg dark:border-slate-700 overflow-hidden">
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  onClick={() => setExpandedUnitId(isExpanded ? null : unit.id)}
                  title={isExpanded ? 'Recolher unidade' : 'Expandir unidade'}
                >
                  <div className="font-semibold text-indigo-600 dark:text-indigo-400">{unit.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-full px-2 py-0.5">{unitEquipment.length} equip.</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id); }} title="Excluir unidade" className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
                     <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 animate-fade-in-down space-y-4">
                    <button
                      onClick={() => setAddingEquipmentToUnit(addingEquipmentToUnit === unit.id ? null : unit.id)}
                      title="Adicionar um novo equipamento a esta unidade"
                      className="flex items-center text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      {addingEquipmentToUnit === unit.id ? 'Cancelar' : 'Adicionar Equipamento'}
                    </button>

                    {addingEquipmentToUnit === unit.id && (
                      <div className="p-4 bg-white dark:bg-slate-700 rounded-lg shadow space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Nome</label>
                              <input type="text" placeholder="Ex: Motor Elétrico" value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-600 dark:border-slate-500"/>
                            </div>
                            <div>
                               <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Tipo</label>
                               <select 
                                 value={newEquipment.type} 
                                 onChange={handleTypeChange} 
                                 className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-600 dark:border-slate-500"
                               >
                                <option value="">Selecione um tipo</option>
                                {Object.keys(equipmentTypeTemplates).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                                <option value="Outro">Outro (personalizado)</option>
                               </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Nº de Série</label>
                              <input type="text" placeholder="Ex: SN-123456" value={newEquipment.serialNumber} onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-600 dark:border-slate-500"/>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Modelo</label>
                              <input type="text" placeholder="Ex: W22" value={newEquipment.model} onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-600 dark:border-slate-500"/>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Fabricante</label>
                              <input type="text" placeholder="Ex: WEG" value={newEquipment.manufacturer} onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-600 dark:border-slate-500"/>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Data de Instalação</label>
                              <input type="date" value={newEquipment.installationDate} onChange={(e) => setNewEquipment({ ...newEquipment, installationDate: e.target.value })} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-600 dark:border-slate-500"/>
                            </div>
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Criticidade</label>
                            <select value={newEquipment.criticality} onChange={(e) => setNewEquipment({ ...newEquipment, criticality: e.target.value as 'High' | 'Medium' | 'Low' })} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-600 dark:border-slate-500">
                                <option value="Low">Baixa</option>
                                <option value="Medium">Média</option>
                                <option value="High">Alta</option>
                            </select>
                         </div>
                         
                         {/* Custom Fields Section */}
                        <div className="border-t dark:border-slate-600 pt-4 mt-4">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Campos de Medição Personalizados</h4>
                            <div className="space-y-2">
                                {newEquipment.customFields.map((field, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-600/50 p-2 rounded">
                                        <span className="flex-grow text-sm">{field.name} ({field.unit})</span>
                                        <button onClick={() => handleRemoveCustomField(index)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                             {newEquipment.customFields.length === 0 && <p className="text-xs text-center text-slate-500 dark:text-slate-400 py-2">Nenhum campo personalizado. Adicione abaixo ou selecione um tipo de equipamento.</p>}
                            <div className="flex items-end gap-2 mt-3">
                                <div className="flex-grow">
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Nome do Campo</label>
                                    <input type="text" placeholder="Ex: Corrente Elétrica" value={newCustomFieldName} onChange={e => setNewCustomFieldName(e.target.value)} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-600 dark:border-slate-500" />
                                </div>
                                <div className="flex-grow">
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Unidade</label>
                                    <input type="text" placeholder="Ex: A, V, RPM" value={newCustomFieldUnit} onChange={e => setNewCustomFieldUnit(e.target.value)} className="w-full p-2 text-sm border rounded bg-slate-50 dark:bg-slate-600 dark:border-slate-500" />
                                </div>
                                <button type="button" onClick={handleAddCustomField} className="bg-gray-600 text-white px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition-colors">Adicionar Campo</button>
                            </div>
                        </div>

                         <button onClick={() => handleAddEquipment(unit.id)} className="mt-4 bg-green-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-green-700 transition-colors">Salvar Equipamento</button>
                      </div>
                    )}
                    
                    {/* Equipment List */}
                    <div className="mt-4">
                      {unitEquipment.length > 0 ? (
                        <div className="space-y-3">
                          {unitEquipment.map(e => (
                            <div key={e.id} className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                               <div className="flex justify-between items-start gap-2">
                                 <div>
                                   <p className="font-semibold text-slate-800 dark:text-slate-200">{e.name}</p>
                                   <p className="text-xs text-slate-500 dark:text-slate-400">{e.type} | SN: {e.serialNumber}</p>
                                   <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                     {e.model && <span>Modelo: {e.model} | </span>}
                                     {e.manufacturer && <span>Fabricante: {e.manufacturer}</span>}
                                   </div>
                                   {e.installationDate && <p className="text-xs text-slate-500 dark:text-slate-400">Instalado em: {new Date(e.installationDate + 'T00:00:00').toLocaleDateString()}</p>}
                                    {e.customFields && e.customFields.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Campos Personalizados:</p>
                                        <ul className="list-disc list-inside text-xs text-slate-500 dark:text-slate-400">
                                          {e.customFields.map(f => <li key={f.name}>{f.name} ({f.unit})</li>)}
                                        </ul>
                                      </div>
                                    )}
                                 </div>
                                 <div className="flex flex-col items-end flex-shrink-0 space-y-2">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${criticalityClasses[e.criticality]}`}>{e.criticality === 'High' ? 'Alta' : e.criticality === 'Medium' ? 'Média' : 'Baixa'}</span>
                                    <div className="flex items-center">
                                      <button 
                                        onClick={() => setChartVisibleForEquipmentId(chartVisibleForEquipmentId === e.id ? null : e.id)} 
                                        title="Mostrar/ocultar histórico de medições" 
                                        className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                                      >
                                        <ChartIcon />
                                      </button>
                                      <button onClick={() => handleDeleteEquipment(e.id)} title="Excluir equipamento" className="text-red-500 hover:text-red-700 p-1">
                                        <TrashIcon />
                                      </button>
                                    </div>
                                 </div>
                               </div>
                               {chartVisibleForEquipmentId === e.id && (
                                <MeasurementChart 
                                  equipment={e} 
                                  collectionsForEquipment={collections.filter(c => c.equipmentId === e.id)} 
                                />
                               )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-2">Nenhum equipamento cadastrado nesta unidade.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <p className="text-center p-4">Nenhuma unidade cadastrada. Comece adicionando uma nova unidade.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentManager;