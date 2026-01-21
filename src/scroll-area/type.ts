import type { CSSProperties } from 'react';

export type ScrollbarProps = {
	/** 根元素宽 */
	width?: CSSProperties['width'];
	/** 根元素高 */
	height?: CSSProperties['height'];
	/** 显示滚动条的时机，'none' 表示一直显示 */
	trigger?: 'hover' | 'none';
	/** Y轴滚动条宽度 */
	scrollbarWidth?: number;
	/** X轴滚动条高度 */
	scrollbarHeight?: number;
	/** 是否可以横向滚动 */
	xScrollable?: boolean;
	/** 设置滚动条位置 */
	scrollTo?: ScrollToOptions;
	/** 监听滚动 */
	onScroll?: (scroll: { top: number; left: number }) => void;
};
