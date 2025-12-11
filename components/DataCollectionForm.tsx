import React, { useState, useEffect, useMemo } from 'react';
import type { DataCollection, Equipment, Employee, Unit } from '../types';

interface DataCollectionFormProps {
  units: Unit[];
  equipment: Equipment[];
  employees: Employee[];
  onSave: (collection: DataCollection) => void;
  existingCollection: DataCollection | null;
  onCancel: () => void;
  currentUser: Employee;
}

const DataCollectionForm: React.FC<DataCollectionFormProps> = ({ units, equipment, employees, onSave, existingCollection, onCancel, currentUser }) => {
  const getInitialState = () => ({
    equipmentId: '',
    employeeId: currentUser.id, // Pre-select current user
    date: new Date().toISOString().substring(0, 16),
    vibration: 0,
    temperature: 0,
    pressure: 0,
    notes: '',
    photo: undefined,
    customFieldValues: {},
  });
  
  const [collection, setCollection] = useState<Omit<DataCollection, 'id'>>(getInitialState());

  useEffect(() => {
    if (existingCollection) {
      setCollection({
        ...existingCollection,
        date: new Date(existingCollection.date).toISOString().substring(0, 16),
        customFieldValues: existingCollection.customFieldValues || {},
      });
    } else {
      setCollection(getInitialState());
    }
  }, [existingCollection, currentUser.id]);

  const selectedEquipment = useMemo(() => {
    return equipment.find(e => e.id === collection.equipmentId);
  }, [collection.equipmentId, equipment]);

  const handleCustomFieldChange = (fieldName: string, value: string) => {
    setCollection(prev => ({
      ...prev,
      customFieldValues: {
        ...prev.customFieldValues,
        [fieldName]: parseFloat(value) || 0
      }
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCollection({ ...collection, photo: event.target?.result as string });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collection.equipmentId || !collection.employeeId) {
        alert('Por favor, selecione um equipamento e um colaborador.');
        return;
    }
    
    onSave({
      ...collection,
      id: existingCollection ? existingCollection.id : Date.now().toString(),
      date: new Date(collection.date).toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{existingCollection ? 'Editar Coleta' : 'Nova Coleta de Dados'}</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Equipamento</label>
            <select
              value={collection.equipmentId}
              onChange={(e) => setCollection({ ...collection, equipmentId: e.target.value, customFieldValues: {} })}
              className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
              required
            >
              <option value="" disabled>Selecione um equipamento</option>
              {units.map(unit => (
                <optgroup key={unit.id} label={unit.name}>
                  {equipment
                    .filter(e => e.unitId === unit.id)
                    .map(e => <option key={e.id} value={e.id}>{e.name}</option>)
                  }
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Colaborador</label>
            <select
              value={collection.employeeId}
              onChange={(e) => setCollection({ ...collection, employeeId: e.target.value })}
              className="w-full p-2 border rounded bg-slate-200 dark:bg-slate-700 dark:border-slate-600"
              required
              disabled // User is pre-selected
            >
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data e Hora</label>
          <input
            type="datetime-local"
            value={collection.date}
            onChange={(e) => setCollection({ ...collection, date: e.target.value })}
            className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
          />
        </div>

        <div className="border-t dark:border-slate-700 pt-4">
           <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Medições Gerais</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vibração</label>
                <input type="number" step="0.01" value={collection.vibration} onChange={e => setCollection({...collection, vibration: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temperatura (°C)</label>
                <input type="number" step="0.1" value={collection.temperature} onChange={e => setCollection({...collection, temperature: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pressão (bar)</label>
                <input type="number" step="0.1" value={collection.pressure} onChange={e => setCollection({...collection, pressure: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600"/>
              </div>
            </div>
        </div>
        
        {selectedEquipment && selectedEquipment.customFields.length > 0 && (
           <div className="border-t dark:border-slate-700 pt-4">
             <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Medições Específicas do Equipamento</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedEquipment.customFields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{field.name} {field.unit && `(${field.unit})`}</label>
                    <input 
                      type="number" 
                      step="any" 
                      value={collection.customFieldValues[field.name] || ''}
                      onChange={e => handleCustomFieldChange(field.name, e.target.value)}
                      className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
                    />
                  </div>
                ))}
             </div>
           </div>
        )}


        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Observações</label>
          <textarea
            rows={4}
            value={collection.notes}
            onChange={(e) => setCollection({ ...collection, notes: e.target.value })}
            className="w-full p-2 border rounded bg-slate-50 dark:bg-slate-700 dark:border-slate-600"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Adicionar Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {collection.photo && (
            <div className="mt-2">
                <img src={collection.photo} alt="Pré-visualização" className="max-h-40 rounded-lg"/>
            </div>
        )}

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onCancel} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            {existingCollection ? 'Salvar Alterações' : 'Salvar Coleta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataCollectionForm;