import { Alignment, emojiLevel } from '../types/options';

export interface IColumnSize {
	ratio: number;
	size: number;
	readonly headerSize: number;
	readonly contentSize: number;
	readonly headAlign: Alignment;
	readonly align: Alignment;
	readonly tabSize: number;
	readonly eLevel: emojiLevel;
}
