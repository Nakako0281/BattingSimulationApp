import { ReactNode, memo, useCallback } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  const handleClick = useCallback(() => {
    action?.onClick();
  }, [action]);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 md:p-12 text-center">
      {icon && <div className="mb-4 flex justify-center text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {action && (
        <button
          onClick={handleClick}
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default memo(EmptyState);
