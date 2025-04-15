import {
	ItemType,
	MenuItemType,
	MenuItemGroupType,
	MenuDividerType,
} from "antd/es/menu/interface";
import StrokeIcon from "../icon/icon";

export type IconSvgObject =
	| [
			string,
			{
				[key: string]: string | number;
			},
	  ][]
	| readonly (readonly [
			string,
			{
				readonly [key: string]: string | number;
			},
	  ])[];

export function listingActionMenuItemGroup(
	key: string,
	children: ItemType<MenuItemType>[],
	render: boolean = true
): MenuItemGroupType | undefined {
	if (!render || children.length === 0) {
		return;
	}
	return {
		type: "group",
		key,
		style: { marginTop: 0, marginBottom: 8 },
		children,
	};
}

export function listingActionMenuItem(
	key: string,
	label: string,
	onClick: () => void,
	options?: {
		icon?: IconSvgObject;
		danger?: boolean;
		render?: boolean;
	}
): (MenuItemType & { onClick?: () => void }) | undefined {
	if (!(options?.render ?? true)) {
		return;
	}
	return {
		type: "item",
		key,
		label,
		danger: options?.danger,
		icon:
			options?.icon === undefined ? undefined : (
				<StrokeIcon icon={options?.icon} />
			),
		style: { gap: 8 },
		onClick,
	};
}

export function seperateListingActionMenuItem(
	items: ItemType[]
): (ItemType | MenuDividerType)[] {
	return items.flatMap((item, index) => {
		if (index === 0) {
			return [item];
		}
		const divider: MenuDividerType = {
			type: "divider",
			style: { margin: 0 },
		};
		return [divider, item];
	});
}

export function filterOutEmptyItems(
	...items: (ItemType | undefined)[]
): ItemType[] {
	return items.filter((item) => item !== undefined);
}
