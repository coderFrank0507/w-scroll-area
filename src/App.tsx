import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import WScrollArea from "./scroll-area";

function App() {
	const [count, setCount] = useState(0);

	return (
		<WScrollArea height="300px" trigger="none">
			<div>
				<div>
					<a target="_blank">
						<img src={viteLogo} className="logo" alt="Vite logo" />
					</a>
					<a target="_blank">
						<img src={reactLogo} className="logo react" alt="React logo" />
					</a>
				</div>
				<h1>Vite + React</h1>
				<div className="card">
					<button onClick={() => setCount(count => count + 1)}>count is {count}</button>
					<p>
						Edit <code>src/App.tsx</code> and save to test HMR
					</p>
				</div>
				<div className="read-the-docs">Click on the Vite and React logos to learn more</div>
			</div>
		</WScrollArea>
	);
}

export default App;
