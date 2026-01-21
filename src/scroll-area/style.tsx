import styled from 'styled-components';
import type { CSSProperties } from 'react';

export const duration = 0.2;

export const WScrollbarStyle = styled.div<{
	$width: CSSProperties['width'];
	$height: CSSProperties['height'];
	$scrollbarWidth: number;
	$scrollbarHeight: number;
	$xScrollable: boolean;
}>`
	width: ${(p) => p.$width || '100%'};
	height: ${(p) => p.$height || '100%'};
	position: relative;
	overflow: hidden;

	.w-scrollbar-devtool {
		position: fixed;
		top: 24px;
		right: 24px;
		width: 150px;
		padding: 14px;
		background: #fff;
		border-radius: 10px;
		border: 4px solid #78b7ff;
	}

	.w-scrollbar-container {
		width: 100%;
		height: 100%;
		border: 0px solid transparent;
		overflow-y: auto;
		overflow-x: ${(p) => (p.$xScrollable ? 'auto' : 'hidden')};
		scrollbar-width: none;

		.w-scrollbar-content {
			width: fit-content;
			min-width: 100%;
		}
	}

	.w-scrollbar-rail-disabled {
		z-index: -1;
	}

	.w-scrollbar-rail-y {
		position: absolute;
		right: 2px;
		top: 2px;
		bottom: 2px;
		width: ${(p) => p.$scrollbarWidth}px;
		background: transparent;
	}

	.w-scrollbar-rail-x {
		position: absolute;
		left: 2px;
		right: 2px;
		bottom: 2px;
		height: ${(p) => p.$scrollbarHeight}px;
		background: transparent;
	}

	.w-scrollbar-rail_y,
	.w-scrollbar-rail_x {
		position: absolute;
		z-index: 999;
		border-radius: 5px;
		overflow: hidden;
		cursor: pointer;
		pointer-events: all;
	}
	.w-scrollbar-rail_y {
		width: 100%;
	}
	.w-scrollbar-rail_x {
		height: 100%;
	}
	.w-scrollbar-background {
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.25);
		transition: background ${duration}s ease;
		&:hover {
			background: rgba(0, 0, 0, 0.5);
		}
	}

	.w-scroll-enter {
		opacity: 0;
	}
	.w-scroll-enter-active {
		opacity: 1;
		transition: opacity ${duration}s ease;
	}
	.w-scroll-exit {
		opacity: 1;
		transition: opacity ${duration}s ease;
	}
	.w-scroll-exit-active {
		opacity: 0;
	}
`;
