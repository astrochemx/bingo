import { ProductionMode } from "bingo";

import { mergeBlockCreations } from "../mergers/mergeBlockCreations.js";
import { BlockWithAddons, BlockWithoutAddons } from "../types/blocks.js";
import { BlockCreation } from "../types/creations.js";
import { StratumTemplateOptions } from "../types/templates.js";

/**
 * Settings to run a Block with {@link produceBlock} that might have addons.
 * @template Addons Block-specific extensions, if defined by the Block's schema.
 * @template Options Options values as described by the Block's Base's options schema, as well as preset.
 * @see {@link https://www.create.bingo/engines/stratum/apis/producers#produceblock}
 */
export type ProduceBlockSettings<
	Addons extends object | undefined,
	Options extends object,
> = Addons extends object
	? ProduceBlockSettingsWithAddons<Addons, Options>
	: ProduceBlockSettingsWithoutAddons<Options>;

/**
 * Settings to run a Block with {@link produceBlock} that defines addons.
 * @template Addons Block-specific extensions as defined by the Block's schema.
 * @template Options Options values as described by the Block's Base's options schema, as well as preset.
 * @see {@link https://www.create.bingo/engines/stratum/apis/producers#produceblock}
 */
export interface ProduceBlockSettingsWithAddons<
	Addons extends object,
	Options extends object,
> extends ProduceBlockSettingsWithoutAddons<Options> {
	/**
	 * Addon values to provide to the Block.
	 */
	addons?: Addons;
}

/**
 * Settings to run a Block with {@link produceBlock} that does not define addons.
 * @template Options Options values as described by the Block's Base's options schema, as well as preset.
 * @see {@link https://www.create.bingo/engines/stratum/apis/producers#produceblock}
 */
export interface ProduceBlockSettingsWithoutAddons<Options extends object> {
	/**
	 * Which repository mode Bingo is being run in.
	 * @see {@link https://create.bingo/build/concepts/modes}
	 */
	mode?: ProductionMode;

	/**
	 * Whether Bingo is being run in an "offline" mode.
	 * @see {@link http://create.bingo/build/details/contexts#options-offline}
	 */
	offline?: boolean;

	/**
	 * Options values as described by the Block's Base's options schema.
	 */
	options: Options;
}

/**
 * Produces a single Block that defines addons.
 * @template Addons Block-specific extensions, if defined by the Block's schema.
 * @template Options Options values as described by the Block's Base's options schema, as well as preset.
 * @see {@link https://www.create.bingo/engines/stratum/apis/producers#produceblock}
 */
export function produceBlock<Addons extends object, Options extends object>(
	block: BlockWithAddons<Addons, Options>,
	settings: ProduceBlockSettingsWithAddons<Addons, Options>,
): Partial<BlockCreation<Options>>;

/**
 * Produces a single Block that does not define addons.
 * @template Options Options values as described by the Block's Base's options schema, as well as preset.
 * @see {@link https://www.create.bingo/engines/stratum/apis/producers#produceblock}
 */
export function produceBlock<Options extends object>(
	block: BlockWithoutAddons<Options>,
	settings: ProduceBlockSettingsWithoutAddons<Options>,
): Partial<BlockCreation<Options>>;

/**
 * Produces a single Block.
 * @template Addons Block-specific extensions, if defined by the Block's schema.
 * @template Options Options values as described by the Block's Base's options schema, as well as preset.
 * @see {@link https://www.create.bingo/engines/stratum/apis/producers#produceblock}
 */
export function produceBlock<
	Addons extends object,
	Options extends StratumTemplateOptions,
>(
	block: BlockWithAddons<Addons, Options> | BlockWithoutAddons<Options>,
	settings: ProduceBlockSettings<Addons, Options>,
): Partial<BlockCreation<Options>> {
	let creation = block.produce(settings);

	const augment = settings.mode && block[settings.mode];
	if (augment) {
		const augmented = augment({
			addons: {} as Addons,
			...settings,
		});
		creation = mergeBlockCreations(creation, augmented);
	}

	return creation;
}
