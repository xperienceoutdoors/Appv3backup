import React from 'react';
import ActivitiesTab from './tabs/ActivitiesTab';
import { Activity } from '../../types/business/Activity';

interface ActivityTabsProps {
  selectedCategoryId?: string | null;
  onEditActivity?: (activity: Activity) => void;
}

const ActivityTabs: React.FC<ActivityTabsProps> = ({ selectedCategoryId, onEditActivity }) => {
  return <ActivitiesTab selectedCategoryId={selectedCategoryId} onEditActivity={onEditActivity} />;
};

export default ActivityTabs;
