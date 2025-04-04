// scripts/generate-docs.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "../src");
const OUTPUT_FILE = path.resolve(__dirname, "../docs/structure.md");

const TARGETS = [
	{ name: "Routes", dir: "app", handler: listRoutes },
	{ name: "Components", dir: "components", handler: listFlatExports },
	{ name: "Hooks", dir: "hooks", handler: listFlatExports },
	{ name: "Utils", dir: "utils", handler: listFlatExports },
	{ name: "Lib", dir: "lib", handler: listFlatExports },
];

function listRoutes(baseDir: string): string[] {
	const result: string[] = [];

	function walk(dir: string, currentRoute: string) {
		const files = fs.readdirSync(dir);
		for (const file of files) {
			const fullPath = path.join(dir, file);
			const stat = fs.statSync(fullPath);

			if (stat.isDirectory()) {
				const segment = file.startsWith("(") ? "" : `/${file}`;
				walk(fullPath, currentRoute + segment);
			} else if (file === "page.tsx" || file === "layout.tsx") {
				const type = file.replace(".tsx", "");
				result.push(`${currentRoute || "/"} → (${type})`);
			} else if (file === "route.ts") {
				result.push(`${currentRoute || "/api"} → (API route)`);
			}
		}
	}

	walk(path.join(ROOT, baseDir), "");
	return result;
}

function listFlatExports(baseDir: string): string[] {
	const output: string[] = [];

	function walk(dir: string) {
		if (!fs.existsSync(dir)) return;
		const files = fs.readdirSync(dir);

		for (const file of files) {
			const fullPath = path.join(dir, file);
			const stat = fs.statSync(fullPath);

			if (stat.isDirectory()) {
				walk(fullPath);
			} else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
				const contents = fs.readFileSync(fullPath, "utf-8");
				const named = [...contents.matchAll(/export function (\w+)/g)].map(
					(m) => m[1]
				);
				const defaultFunc = contents.match(
					/export default function (\w+)?/
				);
				const defaultArrow = contents.match(/export default (\w+)/);

				const jsDocMatch = contents.match(/\/\*\*([\s\S]*?)\*\//);
				const jsDoc = jsDocMatch
					? jsDocMatch[1]
							.replace(/\s*\*\s?/g, "")
							.trim()
							.split("\n")[0]
					: "";

				const exports: string[] = [...named];
				if (defaultFunc) {
					exports.push(
						defaultFunc[1] || path.basename(file, path.extname(file))
					);
				} else if (defaultArrow) {
					exports.push(defaultArrow[1]);
				}

				const exportLine =
					exports.length > 0
						? `- \`${file}\`: ${exports.join(", ")}${jsDoc ? " — " + jsDoc : ""}`
						: `- \`${file}\`${jsDoc ? " — " + jsDoc : ""}`;

				output.push(exportLine);
			}
		}
	}

	walk(path.join(ROOT, baseDir));
	return output;
}

function generateDocumentation() {
	let doc = `# Project Structure\n\nGenerated on ${new Date().toISOString()}\n\n---\n`;

	for (const target of TARGETS) {
		doc += `\n## ${target.name}\n\n`;
		const items = target.handler(target.dir);
		if (items.length === 0) {
			doc += "_No entries found._\n";
		} else {
			doc += items.join("\n") + "\n";
		}
	}

	fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
	fs.writeFileSync(OUTPUT_FILE, doc, "utf-8");
	console.log(`✅ Docs generated at: ${OUTPUT_FILE}`);
}

generateDocumentation();
