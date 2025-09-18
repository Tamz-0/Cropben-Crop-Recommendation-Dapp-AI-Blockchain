import React from 'react';

const ActionCard = ({ icon, title, onClick }) => (
  <div onClick={onClick} className="dashboard-card bg-white p-6 rounded-lg shadow-lg text-center cursor-pointer">
    <i className={`fas ${icon} text-4xl text-green-600 mb-4`}></i>
    <h3 className="text-xl font-semibold">{title}</h3>
  </div>
);

export default ActionCard;
