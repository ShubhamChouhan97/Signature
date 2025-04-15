import React, { useEffect, useState } from "react";
import {
	Button,
	Drawer,
	Form,
	Input,
	Popconfirm,
	message,
	Select,
	Tag,
	Flex,
} from "antd";
import CustomTable from "../components/CustomTable";
import { courtClient } from "../store";
import { useNavigate } from "react-router";
import MainAreaLayout from "../components/main-layout/main-layout";
import { AxiosError } from "axios";

interface Court {
	userCount: number;
	id: string;
	name: string;
	address: string;
}

export const CourtManagement: React.FC = () => {
	const [courts, setCourts] = useState<Court[]>([]);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();
	const [currentCourt, setCurrentCourt] = useState<Court | null>(null);
	const navigate = useNavigate();
	const [, setCurrentPage] = useState<number>(1);

	const fetchCourts = async () => {
		try {
			setLoading(true);
			const data = await courtClient.getCourts();
			setCourts(data);
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(error.response?.data?.error);
				return;
			}
			if (error instanceof Error) {
				message.error(error.message);
				return;
			}
			message.error("Failed to fetch courts");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateCourt = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);
			console.log(values);
			await courtClient.createNewCourt(values);
			fetchCourts();
			message.success("Court created successfully!");
			setIsDrawerOpen(false);
			form.resetFields();
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(error.response?.data?.error);
				return;
			}
			if (error instanceof Error) {
				message.error(error.message);
				return;
			}
			message.error("Failed to create court");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteCourt = async (id: string) => {
		try {
			await courtClient.deleteCourt(id);
			setCourts((prevCourts) =>
				prevCourts.filter((court) => court.id !== id)
			);
			message.success("Court deleted successfully!");
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(error.response?.data?.error);
				return;
			}
			if (error instanceof Error) {
				message.error(error.message);
				return;
			}
			message.error("Failed to delete court");
		}
	};

	const handleUpdateCourt = async (id: string) => {
		try {
			const values = await form.validateFields();
			setLoading(true);
			await courtClient.updateCourt(id, values);
			setCourts((prevCourts) =>
				prevCourts.map((court) =>
					court.id === id ? { ...court, ...values } : court
				)
			);
			message.success("Court updated successfully!");
			setIsDrawerOpen(false);
			setTimeout(() => {
				form.resetFields();
				setCurrentCourt(null);
			}, 200);
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(error.response?.data?.error);
				return;
			}
			if (error instanceof Error) {
				message.error(error.message);
				return;
			}
			message.error("Failed to update court");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleEditCourt = (court: Court) => {
		setCurrentCourt(court);
		form.setFieldsValue(court);
		setIsDrawerOpen(true);
	};

	const handleAddCourt = () => {
		setCurrentCourt(null);
		form.resetFields();
		setIsDrawerOpen(true);
	};

	const data = courts;

	useEffect(() => {
		fetchCourts();
	}, []);

	const columns = [
		{
			title: "Court Name",
			dataIndex: "name",
			key: "name",
			render: (text: string, record: Court) => (
				<Button
					type="link"
					onClick={() => navigate(`/dashboard/court/${record.id}`)}
				>
					{text}
				</Button>
			),
		},
		{
			title: "User Count",
			dataIndex: "userCount",
			key: "userCount",
		},
		{
			title: "Court Abbreviation",
			dataIndex: "courtAbbreviation",
			key: "abbreviation",
		},
		{
			title: "Case Type",
			dataIndex: "courtType",
			key: "courtType",
			render: (types: string[]) => {
				console.log(types);
				return (
					<>
						{types.map((ele, idx) => (
							<Tag color="blue" key={idx}>
								{ele}
							</Tag>
						))}
					</>
				);
			},
		},
		{
			title: "Address",
			dataIndex: "address",
			key: "address",
			render: (text: string) => (
				<>
					{text.split("\n").map((line, idx) => (
						<div key={idx}>{line}</div>
					))}
				</>
			),
		},
		{
			title: "Description",
			dataIndex: "description",
			key: "description",
			render: (text: string) => (
				<>
					{text.split("\n").map((line, idx) => (
						<div key={idx}>{line}</div>
					))}
				</>
			),
		},
		{
			key: "actions",
			render: (record: Court) => (
				<Flex justify="center" gap={6}>
					<Button onClick={() => handleEditCourt(record)}>
						Edit
					</Button>
					<Popconfirm
						title="Delete this court?"
						onConfirm={() => handleDeleteCourt(record.id)}
					>
						<Button danger>Delete</Button>
					</Popconfirm>
				</Flex>
			),
		},
	];

	return (
		<MainAreaLayout
			title="Court Management"
			extra={
				<Button
					type="primary"
					onClick={() => {
						handleAddCourt();
					}}
					className="px-6 py-2 text-lg rounded-md"
				>
					Add Court
				</Button>
			}
		>
			<CustomTable
				serialNumberConfig={{
					name: "",
					show: true,
				}}
				columns={columns}
				data={data}
				loading={loading}
				onPageChange={(page) => setCurrentPage(page)}
			/>

			<Drawer
				title={currentCourt ? "Edit Court" : "Add Court"}
				placement="right"
				width={400}
				open={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
			>
				<Form
					layout="vertical"
					form={form}
					onFinish={handleCreateCourt}
				>
					<Form.Item
						label="Court Name"
						name="name"
						rules={[{ required: true }]}
					>
						<Input placeholder="Enter court name" />
					</Form.Item>
					<Form.Item
						label="Court Unique Abbreviation"
						name="courtAbbreviation"
						rules={[{ required: true }]}
					>
						<Input placeholder="Enter court abbreviation" />
					</Form.Item>
					<Form.Item label={"Case Types"} name="courtType">
						<Select
							mode="tags"
							options={[
								{ label: "Civil", value: "Civil" },
								{ label: "Criminal", value: "Criminal" },
								{
									label: "Family Dispute",
									value: "Family Dispute",
								},
								{
									label: "Property Dispute",
									value: "Property Dispute",
								},
								{ label: "Labour", value: "Labour" },
								{
									label: "Consumer Complaint",
									value: "Consumer Complaint",
								},
								{ label: "Tax Related", value: "Tax Related" },
								{ label: "Corporate", value: "Corporate" },
								{ label: "Cyber Crime", value: "Cyber Crime" },
								{
									label: "Cheque Bounce",
									value: "Cheque Bounce",
								},
								{ label: "Divorce", value: "Divorce" },
								{
									label: "Domestic Violence",
									value: "Domestic Violence",
								},
								{ label: "Inheritance", value: "Inheritance" },
								{
									label: "Accident Claim",
									value: "Accident Claim",
								},
								{ label: "Arbitration", value: "Arbitration" },
								{
									label: "Environmental",
									value: "Environmental",
								},
								{
									label: "Trademark/Patent",
									value: "Trademark/Patent",
								},
								{ label: "Insurance", value: "Insurance" },
								{
									label: "Contract Dispute",
									value: "Contract Dispute",
								},
								{ label: "Fraud", value: "Fraud" },
							]}
							placeholder="Please enter case type"
						/>
					</Form.Item>
					<Form.Item
						label="Address"
						name="address"
						rules={[{ required: true }]}
					>
						<Input.TextArea rows={5} placeholder="Enter address" />
					</Form.Item>
					<Form.Item
						label="Description"
						name="description"
						rules={[{ required: true }]}
					>
						<Input.TextArea
							rows={5}
							placeholder="Enter Description"
						/>
					</Form.Item>
					<Button
						type="primary"
						block
						loading={loading}
						onClick={() =>
							currentCourt
								? handleUpdateCourt(currentCourt.id)
								: handleCreateCourt()
						}
					>
						{currentCourt ? "Update Court" : "Create Court"}
					</Button>
				</Form>
			</Drawer>
		</MainAreaLayout>
	);
};
