class PredAnalyzer {
  public history: string[] = []; // Store last `historySize` predictions
  public historySize: number;
  private consistencyThreshold: number;

  constructor(historySize: number = 5, consistencyThreshold: number = 0.7) {
    this.historySize = historySize;
    this.consistencyThreshold = consistencyThreshold;
  }

  private updateHistory(prediction: string): void {
    this.history.push(prediction);
    if (this.history.length > this.historySize) {
      this.history.shift(); // Remove oldest prediction if history is full
    }
  }

  isStable(): boolean {
    return this.history.length === this.historySize;
  }
  reset() {
    this.history = [];
  }

  analyze(currentPrediction: string): string {
    this.updateHistory(currentPrediction);

    // Count occurrences of each prediction in history
    const predictionCounts: Record<string, number> = this.history.reduce(
      (acc, pred) => {
        acc[pred] = (acc[pred] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Find the most common prediction
    const mostCommonPrediction = Object.keys(predictionCounts).reduce((a, b) =>
      predictionCounts[a] > predictionCounts[b] ? a : b
    );

    const consistency =
      predictionCounts[mostCommonPrediction] / this.history.length;

    // Trust the most common prediction if consistency is high
    return consistency >= this.consistencyThreshold
      ? mostCommonPrediction
      : currentPrediction;
  }
}

export default PredAnalyzer;
