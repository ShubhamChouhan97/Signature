import { Layout } from "antd";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router";

function Dashboard() {
	return (
		<Layout style={{ height: "100vh" }}>
			<Sidebar>
				<Outlet />
			</Sidebar>
		</Layout>
	);
}

export default Dashboard;
