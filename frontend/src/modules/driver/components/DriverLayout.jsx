import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentDriver } from '../services/registrationService';

const onboardingRoutes = new Set([
    '/taxi/driver/lang-select',
    '/taxi/driver/welcome',
    '/taxi/driver/reg-phone',
    '/taxi/driver/otp-verify',
    '/taxi/driver/step-personal',
    '/taxi/driver/step-referral',
    '/taxi/driver/step-vehicle',
    '/taxi/driver/step-documents',
    '/taxi/driver/registration-status',
    '/taxi/driver/status',
]);

const DriverLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(false);
    const [isAllowed, setIsAllowed] = useState(true);

    useEffect(() => {
        const currentPath = location.pathname;

        if (onboardingRoutes.has(currentPath)) {
            setIsAllowed(true);
            setIsChecking(false);
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            setIsAllowed(false);
            navigate('/taxi/driver/reg-phone', { replace: true });
            return;
        }

        let active = true;

        const verifyDriver = async () => {
            setIsChecking(true);

            try {
                const response = await getCurrentDriver();
                const driver = response?.data;
                const isApproved = driver && driver.approve !== false && String(driver.status || '').toLowerCase() !== 'pending';

                if (!active) {
                    return;
                }

                if (!isApproved) {
                    setIsAllowed(false);
                    navigate('/taxi/driver/registration-status', { replace: true });
                    return;
                }

                setIsAllowed(true);
            } catch (error) {
                if (!active) {
                    return;
                }

                setIsAllowed(false);

                if (error?.status === 401) {
                    navigate('/taxi/driver/reg-phone', { replace: true });
                    return;
                }

                if (error?.status === 403) {
                    navigate('/taxi/driver/registration-status', { replace: true });
                    return;
                }

                navigate('/taxi/driver/registration-status', { replace: true });
            } finally {
                if (active) {
                    setIsChecking(false);
                }
            }
        };

        verifyDriver();

        return () => {
            active = false;
        };
    }, [location.pathname, navigate]);

    return (
        <div className="driver-theme min-h-screen">
            {isChecking && !onboardingRoutes.has(location.pathname) ? (
                <div className="min-h-screen flex items-center justify-center bg-white">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                </div>
            ) : (
                <Outlet context={{ isAllowed }} />
            )}
        </div>
    );
};

export default DriverLayout;
