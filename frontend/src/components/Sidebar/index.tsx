import React, { ReactElement, useCallback, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Layout, Menu, message, Flex, Button, Dropdown } from "antd";

import { mainClient, useAppStore } from "../../store";
import Icon, {
	DiffOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	SignatureOutlined,
	UserOutlined,
	LogoutOutlined,
} from "@ant-design/icons";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { roles } from "../../libs/constants";
import { CourtHouseIcon } from "@hugeicons/core-free-icons";
import StrokeIcon from "../icon/icon";

const { Sider } = Layout;

interface SideBarProps {
	children: ReactElement;
}

const courtSvg = () => {
	return <StrokeIcon icon={CourtHouseIcon} />;
};

const Sidebar: React.FC<SideBarProps> = ({ children }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [collapsed, setCollapsed] = useState(false);
	const selectedKey = location.pathname.split("/").pop() as string;
	const user = useAppStore().session;

	const handleLogout = useCallback(async () => {
		try {
			await mainClient.request("GET", "/logout");
			window.location.href = "/login";
		} catch (error) {
			message.error(String(error));
		}
	}, []);

	const navItems: ItemType<MenuItemType>[] = useMemo(() => {
		const items: ItemType<MenuItemType>[] = [];

		if (user?.role !== roles.admin) {
			items.push(
				{
					key: "requests",
					icon: <DiffOutlined />,
					label: "Requests",
					onClick: () => navigate(`/dashboard/requests`),
				},
				{
					key: "signatures",
					icon: <SignatureOutlined />,
					label: "Signatures",
					onClick: () => navigate(`/dashboard/signatures`),
				}
			);
		} else {
			items.push({
				key: "courts",
				icon: <Icon component={courtSvg} />,
				label: "Courts",
				onClick: () => navigate(`/dashboard/courts`),
			});
			items.push({
				key: "users",
				icon: <UserOutlined />,
				label: "Users",
				onClick: () => navigate(`/dashboard/users`),
			});
		}

		return items;
	}, [navigate, user?.role]);

	return (
		<Layout style={{ height: "100%" }}>
			<Sider
				width={"275px"}
				trigger={null}
				collapsible
				collapsed={collapsed}
			>
				<Flex vertical style={{ height: "100%" }}>
					<div
						style={{
							display: "flex",
							justifyContent: "flex-end",
							color: "#fff",
						}}
					>
						{collapsed ? (
							<></>
						) : (
							<div
								style={{
									fontSize: "16px",
									height: "100%",
									width: "100%",
									textAlign: "center",
									alignContent: "center",
									textOverflow: "ellipsis",
									overflow: "hidden",
									textWrap: "nowrap",
									cursor: "pointer",
								}}
								onClick={() => {
									navigate("/");
								}}
							>
								Doc Sign
							</div>
						)}
						<Button
							type="text"
							icon={
								collapsed ? (
									<MenuUnfoldOutlined />
								) : (
									<MenuFoldOutlined />
								)
							}
							onClick={() => setCollapsed(!collapsed)}
							style={{
								color: "#fff",
								fontSize: "16px",
								width: collapsed ? "100%" : 64,
								height: 64,
							}}
						/>
					</div>

					{/* Main Menu */}
					<Menu
						theme="dark"
						mode="inline"
						selectedKeys={[selectedKey]}
						items={navItems}
						style={{ flexGrow: 1 }}
					/>

					{/* Profile Dropdown at the bottom */}
					<div style={{ padding: "12px", textAlign: "center" }}>
						<Dropdown
							menu={{
								items: [
									{
										key: "logout",
										label: "Logout",
										icon: <LogoutOutlined />,
										onClick: handleLogout,
									},
								],
							}}
							placement="topRight"
							trigger={["click"]}
						>
							<Button
								type="text"
								style={{
									width: "100%",
									color: "#fff",
									textAlign: "left",
									display: "flex",
									alignItems: "center",
									justifyContent: collapsed
										? "center"
										: "flex-start",
									gap: "8px",
									overflow: "hidden",
									height: "auto",
									padding: "8px 12px",
								}}
								icon={<UserOutlined />}
							>
								{!collapsed && (
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											overflow: "hidden",
											width: "100%",
										}}
									>
										<div
											style={{
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
												fontWeight: "bold",
											}}
											title={user?.name}
										>
											{user?.name ?? "User"}
										</div>
										<div
											style={{
												fontSize: 12,
												opacity: 0.8,
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
											title={user?.email}
										>
											{user?.email}
										</div>
									</div>
								)}
							</Button>
						</Dropdown>
					</div>
				</Flex>
			</Sider>

			{/* Content Area */}
			<Layout className="w-full h-full max-h-[100vh] overflow-scroll">
				{children}
			</Layout>
		</Layout>
	);
};

export default Sidebar;
