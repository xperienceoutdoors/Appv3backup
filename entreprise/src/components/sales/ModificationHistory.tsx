import React from 'react';
import { ModificationRecord } from '../../types/business/ModificationRecord';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ModificationHistoryProps {
  history: ModificationRecord[];
}

const ModificationHistory: React.FC<ModificationHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Historique des Modifications</h3>

      <div className="flow-root">
        <ul className="-mb-8">
          {history.map((record, recordIdx) => (
            <li key={record.id}>
              <div className="relative pb-8">
                {recordIdx !== history.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ring-8 ring-white">
                      <svg
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {record.description}
                      </p>
                      {record.details && (
                        <p className="mt-1 text-xs text-gray-400">
                          {record.details}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <time dateTime={record.date.toISOString()}>
                        {format(new Date(record.date), 'PPp', { locale: fr })}
                      </time>
                      {record.user && (
                        <p className="text-xs text-gray-400">
                          par {record.user}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ModificationHistory;
