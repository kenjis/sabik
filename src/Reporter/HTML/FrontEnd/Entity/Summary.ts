import { FileMetrics } from '../Entity/FileMetrics';
import { Metrics } from './Metrics';
import { MetricsCalculator } from './MetricsCalculator';
import { MetricsType } from './MetricsType';

export class Summary {
  private readonly metricsCalculator: MetricsCalculator;

  constructor(private readonly fileSummaries: FileMetrics[]) {
    this.metricsCalculator = new MetricsCalculator(
      fileSummaries.flatMap((fileSummary) => fileSummary.metrics)
    );
  }

  getAverageComplexity() {
    return this.metricsCalculator.average(MetricsType.CongnativeComplexity);
  }

  getAverageMaintainability() {
    return this.metricsCalculator.average(MetricsType.Maintainability);
  }

  getTotalLineOfCode() {
    const logicalLineOfCode = this.fileSummaries.reduce(
      (current, fileSummary) => current + fileSummary.logicalLineOfCode,
      0
    );

    return logicalLineOfCode;
  }

  getSumBugsDelivered() {
    return this.metricsCalculator.sum(MetricsType.BugsDelivered);
  }
}
