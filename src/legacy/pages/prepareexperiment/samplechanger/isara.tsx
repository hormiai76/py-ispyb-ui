import { AbstractISARA } from './abstractisara';

export class IsaraRT3 extends AbstractISARA {

  constructor() {
    super();
    this.sampleChangerRadius = 100;
    this.roomTemperatureCells = 3;
    this.insideCells = 29;
  }

}

export class IsaraRT1 extends AbstractISARA {

  constructor() {
    super();
    this.sampleChangerRadius = 100;
    this.roomTemperatureCells = 1;
    this.insideCells = 29;
  }
  
}