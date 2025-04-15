import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Drawer, Form, Input, Popconfirm, Select, Space } from "antd";
import CustomTable from "../components/CustomTable";
import { roles } from "../libs/constants";
import { courtClient, useAppStore, userClient } from "../store";
import MainAreaLayout from "../components/main-layout/main-layout";
import { useMessage } from "../hooks/message";
import { useMutation, useQuery } from "@tanstack/react-query";

interface User {
	id: string;
	name: string;
	email: string;
	phoneNumber: string;
	role: roles.officer | roles.reader;
	countryCode: string;
}

export const CourtUsers: React.FC = () => {
	const message = useMessage();
	const courtId = useParams()?.courtId;
	const navigate = useNavigate();
	const setAppLoader = useAppStore().setAppLoading;
	const getRole = useAppStore((state) => state.getRole);

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [form] = Form.useForm();

	const resetFormState = () => {
		setIsDrawerOpen(false);
		setSelectedUser(null);
		setTimeout(() => {
			form.resetFields();
			setIsEditing(false);
		}, 100);
	};

	const handleError = (
		error: unknown,
		fallbackMsg = "Something went wrong"
	) => {
		console.error(error);
		if (error instanceof Error) return message.error(error.message);
		if (typeof error === "string") return message.error(error);
		return message.error(fallbackMsg);
	};

	const courtObj = useQuery({
		queryKey: ["court", courtId],
		queryFn: async () => {
			try {
				setAppLoader(true);
				return await courtClient.getCourt(courtId!);
			} catch (err) {
				handleError(err);
				navigate("/dashboard/courts");
				return null;
			} finally {
				setAppLoader(false);
			}
		},
		enabled: !!courtId,
		initialData: null,
	});

	const userData = useQuery({
		queryKey: ["users", courtId],
		queryFn: async () => {
			try {
				return await userClient.list(courtId!);
			} catch (err) {
				handleError(err);
				navigate("/dashboard/courts");
				return null;
			} finally {
				setAppLoader(false);
			}
		},
		enabled: !!courtId,
	});

	const deleteUser = useMutation({
		mutationFn: async (userId: string) => {
			setAppLoader(true);
			await userClient.delete(courtId!, userId);
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

	const handleEditUser = (user: User) => {
		setSelectedUser(user);
		form.setFieldsValue({ ...user, role: `${user.role}` });
		setIsEditing(true);
		setIsDrawerOpen(true);
	};

	const handleAddOrUpdateUser = async () => {
		try {
			const values = await form.validateFields();

			if (isEditing && selectedUser) {
				await userClient.updateUser(courtId!, selectedUser.id, {
					name: values.name,
				});
				message.success("User updated successfully!");
			} else {
				await userClient.createNew(courtId!, values);
				message.success("User added successfully!");
			}

			userData.refetch();
			resetFormState();
		} catch (err) {
			handleError(err, "Failed to save user");
		}
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
			key: "actions",
			render: (record: User) => (
				<Space>
					<Button onClick={() => handleEditUser(record)}>Edit</Button>
					<Popconfirm
						title="Delete this user?"
						onConfirm={() => deleteUser.mutate(record.id)}
					>
						<Button danger>Delete</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<MainAreaLayout
			title={`Manage Users for Court ${courtObj.data?.name ?? ""}`}
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
					onFinish={handleAddOrUpdateUser}
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

					<Button type="primary" block htmlType="submit">
						{isEditing ? "Update User" : "Add User"}
					</Button>
				</Form>
			</Drawer>
		</MainAreaLayout>
	);
};
