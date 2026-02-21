// @ts-ignore
import { IsolationForest } from "isolation-forest";

export class IsolationModel {
  private forest: any;
  private trained = false;

  constructor(private readonly config = { trees: 100, sampleSize: 256 }) {
    this.forest = new IsolationForest();
  }

  train(data: number[][]) {
    if (!data.length) return;
    this.forest.fit(data);
    this.trained = true;
  }

  score(vector: number[]): number {
    if (!this.trained) return 0;
    const scores = this.forest.predict([vector]);
    return scores[0];
  }

  serialize(): string {
    // Currently isolation-forest doesn't have a native export,
    // so we store the configuration/state if supported or wrap for backup.
    // In a real prod setup, we'd use a lib that supports 'export' like ml-isolation-forest.
    return JSON.stringify({
      config: this.config,
      trained: this.trained,
      // Placeholder: actual model weights would be here if exported
    });
  }

  load(serialized: string) {
    const data = JSON.parse(serialized);
    this.trained = data.trained;
    // Load logic for model weights if supported
  }

  isTrained() {
    return this.trained;
  }
}
