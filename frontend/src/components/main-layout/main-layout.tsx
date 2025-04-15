import { Divider, Flex, Layout, Space, Typography } from "antd";

export default function MainAreaLayout(props: {
	title: React.ReactNode;
	description?: React.ReactNode;
	children: React.ReactNode;
	extra?: React.ReactNode;
}) {
	return (
		<>
			<Layout style={{ height: "100%" }}>
				<Layout.Header
					style={{
						padding: "42px 32px",
						backgroundColor: "transparent",
					}}
				>
					<Flex
						align="center"
						justify="space-between"
						style={{ height: "100%" }}
					>
						<Flex vertical>
							<Typography.Title
								level={4}
								style={{ marginBottom: 2 }}
							>
								{props.title}
							</Typography.Title>
							{props.description ? (
								<Typography.Text type="secondary">
									{props.description}
								</Typography.Text>
							) : (
								<></>
							)}
						</Flex>
						<Space
							style={{ justifySelf: "flex-end" }}
							styles={{ item: { display: "flex" } }}
						>
							{props.extra}
						</Space>
					</Flex>
				</Layout.Header>
				<Divider style={{ margin: 0 }} />
				<Layout.Content
					style={{ padding: "16px 32px", borderRadius: 0 }}
				>
					{props.children}
				</Layout.Content>
			</Layout>
		</>
	);
}
