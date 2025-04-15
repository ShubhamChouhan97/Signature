import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useAppStore } from "../../store";

const ProtectedRoute: React.FC = () => {
	const session = useAppStore().session?.userId;
	const isAuthenticated = !!session;

	useEffect(() => {
		console.info(session);
	}, [session]);

	if (isAuthenticated === null) {
		return <div>Loading...</div>;
	}

	return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
