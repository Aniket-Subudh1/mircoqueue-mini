import React from 'react';

const Card = ({ 
  children, 
  title, 
  className = '',
  headerAction,
  ...props 
}) => {
  return (
    <div 
      className={`
        bg-white 
        rounded-lg 
        shadow 
        overflow-hidden
        ${className}
      `}
      {...props}
    >
      {title && (
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">{title}</h3>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;