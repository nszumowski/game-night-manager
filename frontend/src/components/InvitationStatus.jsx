import React from 'react';

const InvitationStatus = ({ invitees }) => {
  const statusGroups = {
    pending: invitees.filter(inv => inv.status === 'pending'),
    accepted: invitees.filter(inv => inv.status === 'accepted'),
    declined: invitees.filter(inv => inv.status === 'declined')
  };

  return (
    <div className="space-y-4">
      {Object.entries(statusGroups).map(([status, users]) => (
        <div key={status}>
          <h3 className="font-medium capitalize mb-2">{status}:</h3>
          {users.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {users.map(inv => (
                <li key={inv.user._id} className="text-gray-700">
                  {inv.user.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">None</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default InvitationStatus; 