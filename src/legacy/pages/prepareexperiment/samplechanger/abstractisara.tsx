import { range } from 'lodash';
import { containerType } from 'legacy/models';
import { AbstractSampleChanger } from './abstractsamplechanger';

export abstract class AbstractISARA extends AbstractSampleChanger {

  constructor() {
    super();
    this.sampleChangerRadius = 100;
    this.roomTemperatureCells = 3;
    this.insideCells = 29;
  }

  plotCells(): JSX.Element {
    return (
      <g>
        <rect
          x={-this.sampleChangerRadius * 2}
          y={-this.sampleChangerRadius * 2}
          width={this.sampleChangerRadius * 3}
          height={this.sampleChangerRadius * 1.17}
          fill="#FFFF"
          z={1000}
        ></rect>
        <line
          x2={-this.sampleChangerRadius * 0.56}
          y2={-this.sampleChangerRadius * 0.83}
          x1={this.sampleChangerRadius * 0.56}
          y1={-this.sampleChangerRadius * 0.83}
          stroke={'#000'}
        ></line>
        <rect
          x={-this.sampleChangerRadius * 0.16 * this.roomTemperatureCells}
          y={this.sampleChangerRadius * 1.14}
          width={this.sampleChangerRadius * 0.32 * this.roomTemperatureCells}
          height={this.sampleChangerRadius * 0.44}
          stroke="#000"
          fill="#CCCCCC"
        ></rect>
      </g>
    );
  }

  getContainerCoordinates(
    cell: number,
    position: number
  ): { x: number; y: number; r: number; xtxt: number; ytxt: number } {
    const r = this.sampleChangerRadius / 8;
    console.log("getContainerCoordinates -> position:" +position);
    const x = this.getX(position);
    const y = this.getY(position);

    const txtYDiff = -this.sampleChangerRadius * 0.16;

    return { x, y, r, xtxt: x, ytxt: y + txtYDiff };
  }

  getX(position: number): number {
    const drawingPosition = this.getDrawingPosition(position);
    if (drawingPosition.nbColumn === 5) {
      return [
        -this.sampleChangerRadius * 0.6,
        -this.sampleChangerRadius * 0.3,
        0,
        this.sampleChangerRadius * 0.3,
        this.sampleChangerRadius * 0.6,
      ][drawingPosition.column];
    }
    if (drawingPosition.nbColumn === 6) {
      return [
        -this.sampleChangerRadius * 0.75,
        -this.sampleChangerRadius * 0.45,
        -this.sampleChangerRadius * 0.15,
        this.sampleChangerRadius * 0.15,
        this.sampleChangerRadius * 0.45,
        this.sampleChangerRadius * 0.75,
      ][drawingPosition.column];
    }
    if (drawingPosition.nbColumn === 2) {
      return [
        -this.sampleChangerRadius * 0.15,
        this.sampleChangerRadius * 0.15
      ][drawingPosition.column];
    }
    if (drawingPosition.nbColumn === 3) {
      return [
        -this.sampleChangerRadius * 0.30,
        this.sampleChangerRadius * 0,
        this.sampleChangerRadius * 0.30
      ][drawingPosition.column];
    }
    if (drawingPosition.nbColumn === 1) {
      console.log("this.sampleChangerRadius:" +this.sampleChangerRadius);
      return [
        -this.sampleChangerRadius * 0
      ][drawingPosition.column];
    }
    if (drawingPosition.nbColumn === 0) {
      return -1;
    }
    return 0;
  }

  getY(position: number): number {
    const drawingPosition = this.getDrawingPosition(position);
    const minY = -this.sampleChangerRadius * 0.6;
    const lineStep = this.sampleChangerRadius * 0.28;
    if (drawingPosition.nbColumn === 1 || drawingPosition.nbColumn === 3) {
      return drawingPosition.line * lineStep + minY +30;
    } else if (drawingPosition.nbColumn === 0) { 
      return -1;
    } else {
      return drawingPosition.line * lineStep + minY;  
    }

  }

  getDrawingPosition(position: number): {
    line: number;
    column: number;
    nbColumn: 5 | 6 | 2 | 1 | 3 | 0;
  } {
    if (position < 5) {
      return { line: 0, column: position, nbColumn: 5 };
    }
    if (position < 11) {
      return { line: 1, column: position - 5, nbColumn: 6 };
    }
    if (position < 16) {
      return { line: 2, column: position - 11, nbColumn: 5 };
    }
    if (position < 22) {
      return { line: 3, column: position - 16, nbColumn: 6 };
    }
    if (position < 27) {
      return { line: 4, column: position - 22, nbColumn: 5 };
    }
    if (position < this.insideCells) {
      return { line: 5, column: position - 27, nbColumn: 2 };
    }
    if ((position >= this.insideCells) && (position < (this.insideCells +this.roomTemperatureCells))) {
      if (this.roomTemperatureCells === 1) {
        return { line: 6, column: position - this.insideCells, nbColumn: 1 };
      }
      if (this.roomTemperatureCells === 3) {
        return { line: 6, column: position - this.insideCells, nbColumn: 3 };
      } else {
        return {line: 7, column: 0, nbColumn: 0};
      }
    }
    console.log("position:" +position);
    return { line: 7, column: 0, nbColumn: 0 };
  }

  getNbCell(): number {
    return 1;
  }
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  getNbContainerInCell(cell: number): number {
    return this.insideCells + this.roomTemperatureCells;
  }

  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  getContainerType(cell: number, position: number): containerType {
    return 'Unipuck';
  }

}
