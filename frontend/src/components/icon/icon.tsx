import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";

export default function StrokeIcon<T extends boolean = true>(props: {
	icon: IconSvgElement;
	render?: T;
}) {
	if (props.render === false) {
		return undefined;
	}
	return <HugeiconsIcon icon={props.icon} size={14} />;
}
