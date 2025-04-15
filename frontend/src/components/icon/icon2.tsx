import Icon from "@ant-design/icons";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";

const testSVG = (props: { icon: IconSvgElement }) => () => {
	return <HugeiconsIcon icon={props.icon} />;
};

export default function StrokeIcon2<T extends boolean = true>(props: {
	icon: IconSvgElement;
	width?: number | string;
	height?: number | string;
	render?: T;
}) {
	if (props.render === false) {
		return undefined;
	}
	return (
		<Icon
			width={props.width}
			height={props.height}
			component={testSVG(props)}
		/>
	);
}
