import { AnyShape, InferredObject, ProductionMode } from "bingo";
import { IntakeDirectory } from "bingo-fs";

import { StratumRefinements } from "../types/refinements.js";
import { StratumTemplate } from "../types/templates.js";
import { getPresetByName } from "../utils/getPresetByName.js";
import { applyBlockRefinements } from "./applyBlockRefinements.js";
import { produceBlocks } from "./produceBlocks.js";

export interface ProduceStratumTemplateSettings<OptionsShape extends AnyShape> {
	/**
	 * Existing file creations to be used for Blocks that can intake Addons.
	 */
	files?: IntakeDirectory;
	mode?: ProductionMode;
	offline?: boolean;
	options: InferredObject<OptionsShape> & { preset: string };
	refinements?: StratumRefinements<InferredObject<OptionsShape>>;
}

export function produceStratumTemplate<
	OptionsShape extends AnyShape = AnyShape,
>(
	template: StratumTemplate<OptionsShape>,
	{
		files,
		mode,
		offline,
		options,
		refinements = {},
	}: ProduceStratumTemplateSettings<OptionsShape>,
) {
	const preset = getPresetByName(template.presets, options.preset);
	if (preset instanceof Error) {
		throw preset;
	}

	const blocks = applyBlockRefinements(
		template.blocks,
		preset.blocks,
		options,
		refinements.blocks,
	);

	return produceBlocks(blocks, {
		blockAddons: refinements.addons,
		files,
		mode,
		offline,
		options,
	});
}
