import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { mainClient, useAppStore } from "../store";
import { Form, Input, Button, Typography, message } from "antd";

const { Title } = Typography;
const { Password } = Input;

const Login: React.FC = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const navigate = useNavigate();
	const getSession = useAppStore().init;
	const session = useAppStore().session?.userId;
	const userRole = useAppStore().session?.role;

	useEffect(() => {
		if (session) {
			if (userRole === 1) {
				navigate("/dashboard/courts");
			} else {
				navigate("/dashboard/requests");
			}
		}
	}, [navigate, session, userRole]);

	const handleLogin = useCallback(async () => {
		try {
			const response = await mainClient.request("POST", "/login", {
				data: { email, password },
			});
			await getSession();
			console.log(response);
			return navigate("/dashboard");
		} catch (err) {
			if (err instanceof AxiosError) {
				if (err?.response?.data?.error) {
					return message.error(String(err.response?.data?.error));
				}
			}
			if (err instanceof Error) {
				return message.error(String(err.message));
			}
			return message.error("Something wrong");
		}
	}, [email, getSession, navigate, password]);

	return (
		<div className="flex justify-center items-center min-h-screen bg-[#b9b9b9] p-4">
			<div className="bg-white shadow-lg rounded-lg p-8 sm:p-12 w-full max-w-md">
				<Title level={2} className="text-center">
					Doc Sign
				</Title>
				<p className="text-center text-lg">Login into your account</p>

				<Form
					requiredMark={false}
					layout="vertical"
					onFinish={handleLogin}
					className="mt-8"
				>
					<Form.Item
						label="Email"
						name="email"
						rules={[
							{
								required: true,
								message: "Please enter your email!",
							},
						]}
					>
						<Input
							placeholder="Enter your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</Form.Item>

					<Form.Item
						label="Password"
						name="password"
						rules={[
							{
								required: true,
								message: "Please enter your password!",
							},
						]}
					>
						<Password
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</Form.Item>

					<Form.Item className="text-center">
						<Button
							type="primary"
							htmlType="submit"
							className="w-full"
						>
							Login
						</Button>
						{/* <div className="mt-2 underline text-blue-600 text-sm">
							<Link to="/forgot-password">Forgot Password?</Link>
						</div> */}
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};

export default Login;
