import { Component, OnInit } from '@angular/core';
import { element } from 'protractor';
import { stringify } from 'querystring';
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
  realPopulation: any = {
    x: [],
    y: [],
  };
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
    console.log(this.binaryPopulation);

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
    const isEven = this.chromoSize % 2 == 0;
    let until = 0;
    if (isEven) {
      until = this.chromoSize / 2;
    } else {
      until = (this.chromoSize - 1) / 2;
    }

    let contX = 0;
    let sum: number = 0;
    resultBinaryPopulation.forEach((element) => {
      for (let index = 0; index < element.length; index++) {
        parseInt(element[index]) == 1
          ? (sum += 2 ** (element.length - (index + 1)))
          : (sum += 0);

        if (index == until - 1) {
          const real =
            -3.1 + ((12.1 + 3.1) / (Math.pow(2, this.chromoSize) - 1)) * sum;
          this.realPopulation.x.push(real);
          sum = 0;
        }

        if (index == this.chromoSize - 1) {
          const real =
            4.1 + ((5.8 - 4.1) / (Math.pow(2, this.chromoSize) - 1)) * sum;
          this.realPopulation.y.push(real);
          sum = 0;
        }
      }
    });

    console.log(this.realPopulation);

    return this.realPopulation;
  }

  resultFunction(resultRealPopulation: any) {
    for (let index = 0; index < this.popSize; index++) {
      this.fx.push(
        15 +
          resultRealPopulation.x[index] *
            Math.cos(2 * Math.PI * resultRealPopulation.x[index]) +
          resultRealPopulation.y[index] *
            Math.cos(14 * Math.PI * resultRealPopulation.y[index])
      );

      this.totalFx +=
        15 +
        resultRealPopulation.x[index] *
          Math.cos(2 * Math.PI * resultRealPopulation.x[index]) +
        resultRealPopulation.y[index] *
          Math.cos(14 * Math.PI * resultRealPopulation.y[index]);
    }

    // resultRealPopulation.forEach((element) => {
    //   this.fx.push(element * element);
    //   this.totalFx += element * element;
    // });

    return this.fx;
  }

  calcScales(resultFx: number[]) {
    resultFx.forEach((element) => {
      this.scales.push(element / this.totalFx);
      this.scalesSorted.push(element / this.totalFx);
    });

    return this.scales;
  }

  setParents() {
    if (this.method == Method.ROULETTE) {
      let father1: { binary: string; index: number } =
        this.selectParentsByRoulette();

      let father2: { binary: string; index: number } =
        this.selectParentsByRoulette();

      while (father1.binary == father2.binary) {
        father2 = this.selectParentsByRoulette();
      }

      console.log(father1, father2);

      return { father1, father2 };
    } else {
      const parents = this.selectParentsBySortition();
      let father1: { binary: string; index: number } = parents[0];
      let father2: { binary: string; index: number } = parents[1];

      console.log(father1, father2);

      return { father1, father2 };
    }
  }

  selectParentsByRoulette(): { binary: string; index: number } {
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

  selectParentsBySortition() {
    let sortitionIndividuals: number[] = [];
    let i = 0;
    while (i < this.popSize / 2) {
      let randomNumber = this.getRandomArbitrary(0, this.popSize);

      const numberExists = sortitionIndividuals.find((element) => {
        return element == randomNumber;
      });

      if (!numberExists) {
        sortitionIndividuals.push(randomNumber);
        i++;
      }
    }

    // console.log(sortitionIndividuals);

    let kIndividualsScales = [];
    for (let index = 0; index < sortitionIndividuals.length; index++) {
      kIndividualsScales.push(this.scales[sortitionIndividuals[index]]);
    }
    console.log(this.binaryPopulation);

    console.log('scalas', this.scales);

    console.log('k', kIndividualsScales);

    const greatestScale1 = this.discoverGreatest(kIndividualsScales);

    const greatestScale2 = this.discoverGreatest(
      this.removeElement(
        kIndividualsScales,
        kIndividualsScales.indexOf(greatestScale1)
      )
    );

    const binary = this.binaryPopulation[this.scales.indexOf(greatestScale1)];
    console.log(binary);
    const index = this.scales.indexOf(greatestScale1);
    const binary2 = this.binaryPopulation[this.scales.indexOf(greatestScale2)];
    console.log(binary2);
    const index2 = this.scales.indexOf(greatestScale2);
    this.method = 2;
    const parents: any = [
      {
        binary: binary,
        index: index,
      },
      { binary: binary2, index: index2 },
    ];
    return parents;
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

    this.realPopulation.x = [];
    this.realPopulation.y = [];
    this.fx = [];
    this.totalFx = 0;
    this.scales = [];
    this.scalesSorted = [];

    this.generations.scales.forEach((element: any) => {});
  }

  discoverSmallest(array: number[]) {
    return Math.min.apply(Math, array);
  }

  discoverGreatest(array: number[]) {
    return Math.max.apply(Math, array);
  }

  getRandomArbitrary(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  removeElement(array: number[], elem: number) {
    var index = array.indexOf(elem);
    if (index > -1) {
      array.splice(index, 1);
    }

    return array;
  }
}
