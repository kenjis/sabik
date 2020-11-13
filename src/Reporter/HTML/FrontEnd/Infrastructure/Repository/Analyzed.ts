import { FileMetrics } from '../../Entity/FileMetrics';
import { FileMetrics as Converter } from '../Converter/FileMetrics';
import { FileMetrics as DataModel } from '../DataModel/FileMetrics';
import { ResourceLoader } from '../ResourceLoader';

type SortKey = 'Complexity'|'BugsDelivered'|'Maintainability';

export class Analyzed {
    private fileMetrics: Map<string, FileMetrics> = new Map;
    private isLoaded: boolean = false;
    private readonly sortLogics = new Map([
        ['BugsDelivered', this.getDiffBugDelivered],
        ['Complexity', this.getDiffMaximumComplexity],
        ['Maintainability', this.getDiffMinimumMaintainability],
    ]);

    constructor(
        private readonly resourceLoader: ResourceLoader,
        private readonly converter: Converter) {
    }

    async getByFileName(target: string) {
        return (await this.load()).get(target) ?? null;
    }

    async hasFileName(target: string) {
        return (await this.load()).has(target);
    }

    async getSortedList(sortKey: SortKey) { 
        const summaries = (await this.getAll()).filter(row => row.getLength());
        const sortLogic = this.sortLogics.get(sortKey)!;
       
        return summaries.sort(sortLogic);
    }

    private getDiffBugDelivered(first: FileMetrics, second: FileMetrics) {
        return Number(second.getSumBugsDelivered()) - Number(first.getSumBugsDelivered());
    }

    private getDiffMaximumComplexity(first: FileMetrics, second: FileMetrics) {
        return Number(second.getMaximumComplexity()) - Number(first.getMaximumComplexity());
    }

    private getDiffMinimumMaintainability(first: FileMetrics, second: FileMetrics) {
        return Number(first.getMinimumMaintainability()) - Number(second.getMinimumMaintainability());
    }

    private async load() {
        if (!this.isLoaded) {
            const seed = await this.resourceLoader.load('analyzed', 'analyzed');
            const dataModels: DataModel[] = JSON.parse(seed);
            this.fileMetrics = dataModels
                .map(row => this.converter.to(row))
                .reduce((map, fileMetrics) => map.set(fileMetrics.fileName, fileMetrics), new Map);

            this.isLoaded = true;
        }

        return this.fileMetrics;
    }

    async getAll() {
        return [...(await this.load()).values()];
    }
}