// types.ts
import { Asset, Entry, EntrySkeletonType } from "contentful";
import type { Document } from "@contentful/rich-text-types";

export interface VinylRecordSkeleton extends EntrySkeletonType {
	fields: {
		title: string;
		subTitle?: string;
		releaseDate?: string;
		genre?: string;
		description?: Document;
		catalogueNumber?: string;
		barcode?: string;
		vinylCondition:
			| "Mint"
			| "Near Mint"
			| "Very Good Plus"
			| "Very Good"
			| "Good Plus"
			| "Good"
			| "Fair"
			| "Poor"
			| "Other";
		sleeveCondition:
			| "Mint"
			| "Near Mint"
			| "Very Good Plus"
			| "Very Good"
			| "Good Plus"
			| "Good"
			| "Fair"
			| "Poor"
			| "Other";
		price?: number;
		coverImage?: Asset;
		rearImage?: Asset;
		otherImages?: Asset[];
		link?: Document;
		artist?: { sys: { id: string } }[];
	};
	contentTypeId: "vinylRecord";
}

export type VinylRecord = Entry<VinylRecordSkeleton>;
