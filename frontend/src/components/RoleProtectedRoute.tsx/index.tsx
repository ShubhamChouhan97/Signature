import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAppStore } from "../../store";

interface RoleProtectedRouteProps {
	allowedRoles: number[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
	allowedRoles,
}) => {
	const session = useAppStore().session;

	if (!session) {
		return <div>Loading session ...</div>;
	}

	const hasAccess = allowedRoles.includes(session.role);
	return hasAccess ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default RoleProtectedRoute;
