import React, { useState } from "react";
import { Button, Drawer, Form, Input, Popconfirm, Select, Space } from "antd";
import CustomTable from "../components/CustomTable";
import { roles } from "../libs/constants";
import { courtClient, useAppStore, userClient } from "../store";
import MainAreaLayout from "../components/main-layout/main-layout";
import { useMessage } from "../hooks/message";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

interface User {
	id: string;
	name: string;
	email: string;
	phoneNumber: string;
	role: roles.officer | roles.reader;
	countryCode: string;
	courtId: {
		id: string;
		name: string;
	};
}

export const Users: React.FC = () => {
	const message = useMessage();
	const getRole = useAppStore((state) => state.getRole);
	const setAppLoader = useAppStore().setAppLoading;

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [form] = Form.useForm();

	const courts = useQuery({
		queryKey: ["court"],
		queryFn: async () => {
			try {
				const court = await courtClient.getCourts();
				console.log(court);
				return court.map((ele) => ({
					value: ele?.id,
					label: ele?.name,
				}));
			} catch (error) {
				if (error instanceof Error) {
					message.error(error.message);
					return;
				}
				if (typeof error === "string") {
					message.error(error);
					return;
				}
				message.error("Something went wrong");
				return;
			}
		},
	});

	const userData = useQuery({
		queryKey: ["userData"],
		queryFn: async () => {
			try {
				const users = await userClient.list();
				return users;
			} catch (error) {
				if (error instanceof Error) {
					message.error(error.message);
					return;
				}
				if (typeof error === "string") {
					message.error(error);
					return;
				}
				message.error("Something went wrong");
				return;
			}
		},
	});

	const handleError = (
		error: unknown,
		fallbackMsg = "Something went wrong"
	) => {
		console.error(error);
		if (error instanceof Error) return message.error(error.message);
		if (typeof error === "string") return message.error(error);
		return message.error(fallbackMsg);
	};

	const resetFormState = () => {
		setIsDrawerOpen(false);
		setSelectedUser(null);
		setTimeout(() => {
			form.resetFields();
			setIsEditing(false);
		}, 100);
	};

	const deleteUser = useMutation({
		mutationFn: async ({
			courtId,
			userId,
		}: {
			courtId: string;
			userId: string;
		}) => {
			setAppLoader(true);
			await userClient.delete(courtId, userId);
			return;
		},
		onSuccess: () => {
			userData.refetch();
			message.success("User deleted successfully");
		},
		onError: (err) => {
			handleError(err);
		},
		onSettled: () => {
			setAppLoader(false);
		},
	});

	const handleEditOrAddCourt = async () => {
		try {
			const values = await form.validateFields();

			if (isEditing && selectedUser) {
				await userClient.updateUser(
					selectedUser.courtId.id,
					selectedUser.id,
					{
						name: values.name,
					}
				);
				message.success("User updated successfully!");
			} else {
				await userClient.createNew(values.courtId, values);
				message.success("User added successfully!");
			}
			userData.refetch();
			resetFormState();
		} catch (err) {
			handleError(err, "Failed to save user");
		}
	};

	const handleEditUser = (user: User) => {
		setSelectedUser(user);
		form.setFieldsValue({
			...user,
			role: `${user.role}`,
			courtId: user.courtId.id,
		});
		setIsEditing(true);
		setIsDrawerOpen(true);
	};

	const columns = [
		{ title: "Name", dataIndex: "name", key: "name" },
		{ title: "Email", dataIndex: "email", key: "email" },
		{
			title: "Phone",
			key: "phone",
			render: (_: unknown, record: User) =>
				`${record.countryCode}-${record.phoneNumber}`,
		},
		{
			title: "User Type",
			dataIndex: "role",
			key: "role",
			render: (role: number) => getRole(role),
		},
		{
			title: "Court",
			dataIndex: "courtId",
			key: "court",
			render: (courtId: { name: string; id: string }) => (
				<Link to={`/dashboard/court/${courtId?.id}`}>
					{courtId?.name}
				</Link>
			),
		},
		{
			key: "actions",
			render: (record: User) => (
				<Space>
					<Button onClick={() => handleEditUser(record)}>Edit</Button>
					<Popconfirm
						title="Delete this user?"
						onConfirm={() => {
							deleteUser.mutate({
								courtId: record.courtId.id,
								userId: record.id,
							});
						}}
					>
						<Button danger>Delete</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<MainAreaLayout
			title={`Manage Users`}
			extra={
				<Button
					type="primary"
					onClick={() => {
						setIsDrawerOpen(true);
						setIsEditing(false);
						form.resetFields();
					}}
				>
					Add User
				</Button>
			}
		>
			<CustomTable
				columns={columns}
				data={userData.data ?? []}
				loading={userData.isLoading}
				serialNumberConfig={{ name: "", show: true }}
			/>

			<Drawer
				title={isEditing ? "Edit User" : "Add User"}
				placement="right"
				width={400}
				open={isDrawerOpen}
				onClose={resetFormState}
			>
				<Form
					layout="vertical"
					form={form}
					onFinish={handleEditOrAddCourt}
					initialValues={{ countryCode: "+91" }}
				>
					<Form.Item
						label="Name"
						name="name"
						rules={[
							{ required: true, message: "Name is required" },
						]}
					>
						<Input placeholder="Enter name" />
					</Form.Item>

					<Form.Item
						label="Email"
						name="email"
						normalize={(value) => value?.toLowerCase()}
						rules={[
							{
								required: true,
								type: "email",
								message: "Valid email is required",
							},
						]}
					>
						<Input placeholder="Enter email" disabled={isEditing} />
					</Form.Item>

					<Form.Item label="Phone Number" required>
						<Space.Compact>
							<Form.Item
								name="countryCode"
								noStyle
								rules={[
									{
										required: true,
										message: "Country code is required",
									},
									{
										pattern: /^\+\d{1,2}$/,
										message: "Valid code (e.g., +91, +1)",
									},
								]}
							>
								<Input
									maxLength={4}
									style={{ width: 70, textAlign: "center" }}
									disabled
								/>
							</Form.Item>
							<Form.Item
								name="phoneNumber"
								noStyle
								rules={[
									{
										required: true,
										message: "Phone number required",
									},
									{
										pattern: /^[0-9]{10}$/,
										message: "Must be 10 digits",
									},
								]}
							>
								<Input
									maxLength={10}
									style={{ width: "285px" }}
									placeholder="Phone number"
									disabled={isEditing}
								/>
							</Form.Item>
						</Space.Compact>
					</Form.Item>

					<Form.Item
						label="User Type"
						name="role"
						rules={[
							{
								required: true,
								message: "User type is required",
							},
						]}
					>
						<Select disabled={isEditing}>
							<Select.Option value={roles.reader.toString()}>
								Reader
							</Select.Option>
							<Select.Option value={roles.officer.toString()}>
								Officer
							</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item
						label="Court"
						name="courtId"
						rules={[
							{
								required: true,
								message: "Court is required",
							},
						]}
					>
						<Select
							placeholder={"Select Court"}
							disabled={isEditing}
							options={courts.data}
						/>
					</Form.Item>

					<Button type="primary" block htmlType="submit">
						{isEditing ? "Update User" : "Add User"}
					</Button>
				</Form>
			</Drawer>
		</MainAreaLayout>
	);
};
