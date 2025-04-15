import { Flex, Layout } from "antd";

export function ListingLayout(props: {
	header?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<Layout>
			{props.header ? (
				<Layout.Header
					style={{
						padding: 0,
						height: "unset",
						backgroundColor: "transparent",
					}}
				>
					<Flex style={{ marginBottom: 16 }}>{props.header}</Flex>
				</Layout.Header>
			) : (
				<></>
			)}
			<Layout.Content>{props.children}</Layout.Content>
		</Layout>
	);
}
