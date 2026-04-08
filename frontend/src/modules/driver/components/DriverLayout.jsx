import React from 'react';
import { Outlet } from 'react-router-dom';

const DriverLayout = () => {
    return (
        <div className="driver-theme min-h-screen">
            <Outlet />
        </div>
    );
};

export default DriverLayout;
