import { Axiom } from "@axiomhq/js";

const AXIOM_TOKEN = process.env.AXIOM_TOKEN;
if (!AXIOM_TOKEN) {
	throw new Error("Missing AXIOM_TOKEN in environment");
}

const axiom = new Axiom({
	token: AXIOM_TOKEN,
	orgId: process.env.AXIOM_ORG_ID,
});

const DATASET = "almond";

export const logEvent = async (
	eventName: string,
	data: Record<string, unknown>
) => {
	try {
		await axiom.ingest(DATASET, [
			{
				_time: new Date().toISOString(),
				event: eventName,
				...data,
			},
		]);
	} catch (error) {
		console.error("Axiom logging failed:", error);
	}
};
