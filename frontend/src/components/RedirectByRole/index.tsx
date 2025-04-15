import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "../../store";
import { Spin } from "antd";

const RedirectByRole = () => {
	const navigate = useNavigate();
	const session = useAppStore().session;

	useEffect(() => {
		if (session) {
			if (session.role === 1) {
				navigate("/dashboard/courts");
			} else {
				navigate("/dashboard/requests");
			}
		}
	}, [session, navigate]);

	return (
		<div className="flex justify-center items-center h-[90vh] w-full">
			<Spin size="large"></Spin>
		</div>
	);
};

export default RedirectByRole;
