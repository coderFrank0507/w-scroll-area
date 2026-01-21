import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { WScrollbarStyle, duration } from "./style";
import { CSSTransition } from "react-transition-group";
import clsx from "clsx";
import type { MouseEvent, PropsWithChildren } from "react";
import type { ScrollbarProps } from "./type";

const WScrollArea = memo((props: PropsWithChildren<ScrollbarProps>) => {
	const {
		children,
		width,
		height,
		trigger = "hover",
		scrollbarWidth = 6,
		scrollbarHeight = 6,
		xScrollable = false,
		scrollTo = {},
		onScroll,
	} = props;

	// dom
	const rootDomRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	// y
	const yRailRef = useRef<HTMLDivElement>(null);
	const [yBarHeight, setYBarHeight] = useState(0);
	const [yBarTop, setYBarTop] = useState(0);
	const [yMouseDown, setYMouseDown] = useState(false);
	const [yHide, setYHide] = useState(trigger !== "hover");
	const yBarRef = useRef<HTMLDivElement>(null);
	const yMoveStartInfo = useRef<{
		scrollbarTop: number;
		startScreenX: number;
		// 内容可滚动的距离
		contentMaxMove: number;
		// 滚动条可滚动的距离
		railMaxMove: number;
	}>({
		scrollbarTop: 0,
		startScreenX: 0,
		contentMaxMove: 0,
		railMaxMove: 0,
	});
	// x
	const xRailRef = useRef<HTMLDivElement>(null);
	const [xBarWidth, setXBarWidth] = useState(0);
	const [xBarLeft, setXBarLeft] = useState(0);
	const [xMouseDown, setXMouseDown] = useState(false);
	const [xHide, setXHide] = useState(trigger !== "hover");
	const xBarRef = useRef<HTMLDivElement>(null);
	const xMoveStartInfo = useRef<{
		scrollbarLeft: number;
		startScreenY: number;
		contentMaxMove: number;
		railMaxMove: number;
	}>({
		scrollbarLeft: 0,
		startScreenY: 0,
		contentMaxMove: 0,
		railMaxMove: 0,
	});

	const prevContentHeight = useRef(0);

	useLayoutEffect(() => {
		containerRef.current.scrollTo(scrollTo);
	}, [scrollTo, scrollTo.top, scrollTo.left]);

	const computeBarHeight = useCallback(() => {
		const { current: containerEl } = containerRef;
		const { current: contentEl } = contentRef;
		const { current: yRailEl } = yRailRef;

		const containerHeight = containerEl.offsetHeight;
		const contentHeight = contentEl.offsetHeight;
		const yRailHeight = yRailEl.offsetHeight;

		const yBarHeight = (yRailHeight * containerHeight) / contentHeight;
		const hiddenScroll = yBarHeight >= containerHeight - 4;
		setYBarHeight(hiddenScroll ? 0 : Math.max(20, yBarHeight));

		// 如果允许横向滚动
		if (xScrollable) {
			const { current: xRailEl } = xRailRef;

			const containerWidth = containerEl.offsetWidth;
			const contentWidth = contentEl.offsetWidth;
			const xRailWidth = xRailEl.offsetWidth;

			const xBarWidth = (xRailWidth * containerWidth) / contentWidth;
			const hiddenScroll = xBarWidth >= containerWidth - 4;
			setXBarWidth(hiddenScroll ? 0 : Math.max(20, xBarWidth));
		}
	}, [xScrollable]);

	useEffect(() => {
		const observer = new ResizeObserver(() => computeBarHeight());
		observer.observe(rootDomRef.current);
		observer.observe(contentRef.current);
		return () => observer.disconnect();
	}, [computeBarHeight]);

	const onContainerScroll = useCallback(() => {
		const { current: containerEl } = containerRef;
		const { current: contentEl } = contentRef;

		const { current: yRailEl } = yRailRef;
		const heightDiff = contentEl.offsetHeight - containerEl.offsetHeight;
		const containerScrollTop = containerEl.scrollTop;
		const yRailSize = yRailEl.offsetHeight;
		setYBarTop((containerScrollTop / heightDiff) * (yRailSize - yBarHeight));

		const { current: xRailEl } = xRailRef;
		const widthDiff = contentEl.offsetWidth - containerEl.offsetWidth;
		const containerScrollLeft = containerEl.scrollLeft;
		const xRailSize = xRailEl.offsetWidth;
		if (widthDiff) setXBarLeft((containerScrollLeft / widthDiff) * (xRailSize - xBarWidth));

		onScroll?.({ top: containerScrollTop, left: containerScrollLeft });
	}, [yBarHeight, xBarWidth, onScroll]);

	useLayoutEffect(() => {
		onContainerScroll();
	}, []);

	useLayoutEffect(() => {
		const { current: contentEl } = contentRef;
		const contentHeight = contentEl.offsetHeight;
		if (prevContentHeight.current !== contentHeight) {
			prevContentHeight.current = contentHeight;
			queueMicrotask(() => computeBarHeight());
		}
	}, [children, computeBarHeight]);

	const onYScrollbarMove = useCallback((event: Event) => {
		const { scrollbarTop, startScreenX, contentMaxMove, railMaxMove } = yMoveStartInfo.current;
		const now = (event as unknown as MouseEvent).screenY;
		const movePx = now - startScreenX + scrollbarTop;
		const toScrollTop = (movePx * contentMaxMove) / railMaxMove;
		containerRef.current.scrollTop = toScrollTop;
	}, []);
	const onXScrollbarMove = useCallback((event: Event) => {
		const { scrollbarLeft, startScreenY, contentMaxMove, railMaxMove } = xMoveStartInfo.current;
		const now = (event as unknown as MouseEvent).screenX;
		const movePx = now - startScreenY + scrollbarLeft;
		const toScrollLeft = (movePx * contentMaxMove) / railMaxMove;
		containerRef.current.scrollLeft = toScrollLeft;
	}, []);

	const onYScrollbarMouseDown = useCallback(
		(event: MouseEvent) => {
			event.preventDefault();
			event.stopPropagation();
			setYMouseDown(true);
			const { current: containerEl } = containerRef;
			const { current: contentEl } = contentRef;
			const { current: yRailEl } = yRailRef;
			yMoveStartInfo.current = {
				startScreenX: event.screenY,
				scrollbarTop: yBarTop,
				contentMaxMove: contentEl.offsetHeight - containerEl.offsetHeight,
				railMaxMove: yRailEl.offsetHeight - yBarHeight,
			};
			document.addEventListener("mousemove", onYScrollbarMove);
		},
		[yBarHeight, yBarTop, onYScrollbarMove],
	);
	const onXScrollbarMouseDown = useCallback(
		(event: MouseEvent) => {
			event.preventDefault();
			event.stopPropagation();
			setXMouseDown(true);
			const { current: containerEl } = containerRef;
			const { current: contentEl } = contentRef;
			const { current: xRailEl } = xRailRef;
			xMoveStartInfo.current = {
				startScreenY: event.screenX,
				scrollbarLeft: xBarLeft,
				contentMaxMove: contentEl.offsetWidth - containerEl.offsetWidth,
				railMaxMove: xRailEl.offsetWidth - xBarWidth,
			};
			document.addEventListener("mousemove", onXScrollbarMove);
		},
		[xBarWidth, xBarLeft, onXScrollbarMove],
	);

	const onYScrollbarMoveEnd = useCallback(
		(event: Event) => {
			event.preventDefault();
			event.stopPropagation();
			setYMouseDown(false);
			document.removeEventListener("mousemove", onYScrollbarMove);
		},
		[onYScrollbarMove],
	);
	const onXScrollbarMoveEnd = useCallback(
		(event: Event) => {
			event.preventDefault();
			event.stopPropagation();
			setXMouseDown(false);
			document.removeEventListener("mousemove", onXScrollbarMove);
		},
		[onXScrollbarMove],
	);

	useEffect(() => {
		document.addEventListener("mouseup", onYScrollbarMoveEnd);
		document.addEventListener("mouseup", onXScrollbarMoveEnd);
		return () => {
			document.removeEventListener("mouseup", onYScrollbarMoveEnd);
			document.removeEventListener("mouseup", onXScrollbarMoveEnd);
		};
	}, [onXScrollbarMoveEnd, onYScrollbarMoveEnd]);

	const YScrollbarNode = useMemo(
		() => (
			<CSSTransition
				in={yHide || yMouseDown}
				nodeRef={yBarRef}
				unmountOnExit
				classNames="w-scroll"
				timeout={duration * 1000}
			>
				<div
					ref={yBarRef}
					className="w-scrollbar-rail_y"
					style={{ height: yBarHeight, top: yBarTop }}
					onMouseDown={onYScrollbarMouseDown}
				>
					<div className="w-scrollbar-background"></div>
				</div>
			</CSSTransition>
		),
		[yBarHeight, yBarTop, yHide, yMouseDown, onYScrollbarMouseDown],
	);
	const XScrollbarNode = useMemo(
		() => (
			<CSSTransition
				in={xHide || xMouseDown}
				nodeRef={xBarRef}
				unmountOnExit
				classNames="w-scroll"
				timeout={duration * 1000}
			>
				<div
					ref={xBarRef}
					className="w-scrollbar-rail_x"
					style={{ width: xBarWidth, left: xBarLeft }}
					onMouseDown={onXScrollbarMouseDown}
				>
					<div className="w-scrollbar-background"></div>
				</div>
			</CSSTransition>
		),
		[xBarWidth, xBarLeft, xHide, xMouseDown, onXScrollbarMouseDown],
	);

	// 鼠标移入容器区域
	const onContainerMouseEnter = useCallback(() => {
		if (trigger === "hover") {
			setYHide(true);
			setXHide(true);
		}
	}, [trigger]);
	// 鼠标移出容器区域
	const onContainerMouseLeave = useCallback(() => {
		if (trigger === "hover") {
			setYHide(false);
			setXHide(false);
		}
	}, [trigger]);

	return (
		<WScrollbarStyle
			className="w-scroll"
			ref={rootDomRef}
			$width={width}
			$height={height}
			$scrollbarWidth={scrollbarWidth}
			$scrollbarHeight={scrollbarHeight}
			$xScrollable={xScrollable}
			onMouseEnter={onContainerMouseEnter}
			onMouseLeave={onContainerMouseLeave}
		>
			<div ref={containerRef} className="w-scrollbar-container" onScroll={onContainerScroll}>
				<div ref={contentRef} className="w-scrollbar-content">
					{children}
				</div>
			</div>
			<div
				ref={yRailRef}
				className={clsx("w-scrollbar-rail-y", !yBarHeight && "w-scrollbar-rail-disabled")}
			>
				{YScrollbarNode}
				<div></div>
			</div>
			<div
				ref={xRailRef}
				className={clsx("w-scrollbar-rail-x", !xBarWidth && "w-scrollbar-rail-disabled")}
			>
				{XScrollbarNode}
				<div></div>
			</div>
		</WScrollbarStyle>
	);
});

export default WScrollArea;
