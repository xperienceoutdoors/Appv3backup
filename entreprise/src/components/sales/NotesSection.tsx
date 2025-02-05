import React, { useState } from 'react';

interface NotesSectionProps {
  notes: string;
  onSave: (notes: string) => Promise<void>;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentNotes, setCurrentNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(currentNotes);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-900">Notes Internes</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setCurrentNotes(notes);
              }}
              className="text-gray-600 hover:text-gray-700 text-sm"
              disabled={isSaving}
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="text-primary-600 hover:text-primary-700 text-sm"
              disabled={isSaving}
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={currentNotes}
          onChange={(e) => setCurrentNotes(e.target.value)}
          className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ajouter des notes internes..."
        />
      ) : (
        <div className="text-sm text-gray-700 whitespace-pre-wrap min-h-[8rem]">
          {notes || 'Aucune note'}
        </div>
      )}
    </div>
  );
};

export default NotesSection;
