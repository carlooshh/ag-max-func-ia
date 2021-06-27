import { Component, OnInit } from '@angular/core';
import { element } from 'protractor';
import { Method } from '../shared/method.enum';

@Component({
  selector: 'app-ag',
  templateUrl: './ag.component.html',
  styleUrls: ['./ag.component.css'],
})
export class AgComponent implements OnInit {
  chromoSize!: number;
  popSize!: number;
  probCrossing!: number;
  probMutation!: number;
  countGenerations!: number;
  method: number = Method.ROULETTE;

  binaryPopulation: string[] = [];
  realPopulation: number[] = [];
  fx: number[] = [];
  totalFx: number = 0;
  scales: number[] = [];
  scalesSorted: number[] = [];
  generations: any = {
    binaryPopulations: [],
    realPopulations: [],
    fxs: [],
    scales: [],
  };
  newPopulation: string[] = [];
  constructor() {}

  ngOnInit(): void {}

  onSelectionMethodChange(selectionIndex: number) {
    this.method = selectionIndex;
  }

  runAg() {
    this.binaryPopulation = this.generateRamdomPop();

    for (let index = 0; index < this.countGenerations; index++) {
      const resultRealPopulation = this.convertBinaryToReal(
        this.binaryPopulation
      );
      const resultFx = this.resultFunction(resultRealPopulation);
      const resultscales = this.calcScales(resultFx);

      const resultParents = this.setParents();
      const resultCrossOp = this.crossOp(
        resultParents.father1,
        resultParents.father2
      );
      const resultMutationOp = this.mutationOp(
        resultCrossOp.son1,
        resultCrossOp.son2
      );

      this.replacePopulation(
        resultMutationOp.son1,
        resultParents.father1.index,
        resultMutationOp.son2,
        resultParents.father2.index
      );

      this.addToGeneration(resultRealPopulation, resultFx, resultscales);
    }
  }

  generateRamdomPop() {
    let element: string = '';
    for (let index = 0; index < this.popSize; index++) {
      for (let index = 0; index < this.chromoSize; index++) {
        const ramdomNumber = Math.random();
        ramdomNumber > 0.5 ? (element += '1') : (element += '0');
      }
      this.binaryPopulation.push(element);
      element = '';
    }

    return this.binaryPopulation;
  }

  convertBinaryToReal(resultBinaryPopulation: string[]) {
    let sum: number = 0;
    resultBinaryPopulation.forEach((element) => {
      for (let index = 0; index < element.length; index++) {
        parseInt(element[index]) == 1
          ? (sum += 2 ** (element.length - (index + 1)))
          : (sum += 0);
      }
      this.realPopulation.push(sum);
      sum = 0;
    });

    return this.realPopulation;
  }

  resultFunction(resultRealPopulation: number[]) {
    resultRealPopulation.forEach((element) => {
      this.fx.push(element * element);
      this.totalFx += element * element;
    });

    return this.fx;
  }

  calcScales(resultFx: number[]) {
    console.log(this.totalFx);

    resultFx.forEach((element) => {
      this.scales.push(element / this.totalFx);
      this.scalesSorted.push(element / this.totalFx);
    });

    return this.scales;
  }

  setParents() {
    let father1: { binary: string; index: number } = this.selectParents();

    let father2: { binary: string; index: number } = this.selectParents();

    while (father1.binary == father2.binary) {
      father2 = this.selectParents();
    }

    return { father1, father2 };
  }

  selectParents(): { binary: string; index: number } {
    //sorteio
    if ((this.method = Method.ROULETTE)) {
    }
    const randomNumber = Math.random();
    let scaleSelected: number = -1;
    let hasOneBigger: boolean = false;

    this.scalesSorted.sort().forEach((element) => {
      if (randomNumber > element) {
        scaleSelected = element;
        hasOneBigger = true;
        return;
      }
    });

    if (hasOneBigger) {
      const binary = this.binaryPopulation[this.scales.indexOf(scaleSelected)];
      const index = this.scales.indexOf(scaleSelected);
      return { binary, index };
    } else {
      scaleSelected = this.scalesSorted[0];
      const binary = this.binaryPopulation[this.scales.indexOf(scaleSelected)];
      const index = this.scales.indexOf(scaleSelected);
      return { binary, index };
    }
  }

  crossOp(
    father1: { binary: string; index: number },
    father2: { binary: string; index: number }
  ) {
    const cut = Math.floor(Math.random() * 1 + (this.chromoSize - 2));

    const gene11 = father1.binary.substring(0, cut);
    const gene12 = father1.binary.substring(cut, father1.binary.length);
    const gene21 = father2.binary.substring(0, cut);
    const gene22 = father2.binary.substring(cut, father2.binary.length);

    const son1 = gene11 + gene22;
    const son2 = gene21 + gene12;

    return { son1, son2 };
  }

  mutationOp(son1: string, son2: string) {
    if (this.probMutation > Math.random()) {
      const cut = Math.floor(Math.random() * 1 + (this.chromoSize - 2));

      if (son1[cut] == '0') {
        son1 = this.replaceAt(cut, '1', son1);
      } else {
        son1 = this.replaceAt(cut, '0', son1);
      }
    }
    if (this.probMutation > Math.random()) {
      const cut = Math.floor(Math.random() * 1 + (this.chromoSize - 2));
      if (son2[cut] == '0') {
        son2 = this.replaceAt(cut, '1', son2);
      } else {
        son2 = this.replaceAt(cut, '0', son2);
      }
    }

    return { son1, son2 };
  }

  replaceAt(index: number, replacement: string, string: string) {
    return (
      string.substring(0, index) + replacement + string.substring(index + 1)
    );
  }

  replacePopulation(
    son1: string,
    index1: number,
    son2: string,
    index2: number
  ) {
    const smallestNumberScale = this.discoverSmallest(this.scales);

    index1 = this.scales.indexOf(this.discoverSmallest(this.scales));
    index2 = this.scales.indexOf(
      this.discoverSmallest(
        this.scales.filter((element) => {
          return element != smallestNumberScale;
        })
      )
    );

    this.binaryPopulation[index1] = son1;
    this.binaryPopulation[index2] = son2;
  }

  addToGeneration(realPopulation: number[], fx: number[], scales: number[]) {
    this.generations.binaryPopulations.push(this.binaryPopulation);
    this.generations.realPopulations.push(realPopulation);
    this.generations.fxs.push(fx);
    this.generations.scales.push(scales);

    this.realPopulation = [];
    this.fx = [];
    this.totalFx = 0;
    this.scales = [];
    this.scalesSorted = [];

    this.generations.scales.forEach((element: any) => {
      console.log(element);
    });
  }

  discoverSmallest(array: number[]) {
    return Math.min.apply(Math, array);
  }
}
