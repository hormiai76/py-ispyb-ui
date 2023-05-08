import {
  useProposal,
  useProposalSamples,
  useShipping,
} from 'legacy/hooks/ispyb';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router';
import CSVReader from 'react-csv-reader';
import { useRef, useState } from 'react';
import { Shipping } from '../model';
import { ProposalDetail, ProposalSample } from 'legacy/pages/model';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import HotTable, { HotColumn } from '@handsontable/react';
import _, { forEach, min } from 'lodash';
import { EXPERIMENT_TYPES } from 'legacy/constants/experiments';

import './importshipping.scss';
import {
  autofixShipping,
  AutoReplacement,
  Line,
  validateShipping,
  Error,
  Value,
  parseShippingCSV,
} from 'legacy/helpers/mx/shipping/shippingcsv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faExclamationTriangle,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { CellMeta } from 'handsontable/settings';
import { CommentObject } from 'handsontable/plugins/comments';
import { CONTAINER_TYPES } from 'legacy/models';
import { addDewarsToShipping } from 'legacy/api/ispyb';
import axios from 'axios';
import { useAuth } from 'hooks/useAuth';
import { SPACE_GROUPS } from 'helpers/spacegroups';
import { registerAllCellTypes } from 'handsontable/cellTypes';
import { registerAllPlugins } from 'handsontable/plugins';
import { useShipmentColumns } from 'legacy/hooks/site';

registerAllCellTypes();
registerAllPlugins();

type Param = {
  proposalName: string;
  shippingId: string;
};

let FIELDS : string[];

const getErrorsForCell = (errors: Error[], row: number, col: number) => {
  const res = errors.filter((e) => e.row === row && e.col === col);
  return res;
};
const getAutoReplacementsForCell = (
  autoReplacements: AutoReplacement[],
  row: number,
  col: number
) => {
  const res = autoReplacements.filter((r) => r.row === row && r.col === col);
  return res;
};

export function ImportShippingFromCSV() {
  
  const { proposalName = '', shippingId = '' } = useParams<Param>();

  

  const { data: shipping, isError: shippingError } = useShipping({
    proposalName,
    shippingId: Number(shippingId),
  });
  const { data: proposalArray, isError: proposalError } = useProposal({
    proposalName,
  });
  const { data: proposalSamples, isError: proposalSampleError } =
    useProposalSamples({ proposalName });

  const errorPage = (msg: unknown) => (
    <Alert variant="danger">
      <>
        Opening CSV import failed: unable to retrieve information.
        <br />
        {msg}
      </>
    </Alert>
  );

  if (!shipping || !proposalArray) {
    return errorPage(
      !shipping ? 'Shipping does not exist.' : 'Proposal does not exist.'
    );
  }
  if (shippingError || proposalError || proposalSampleError) {
    return errorPage(shippingError || proposalError || proposalSampleError);
  }
  const proposal = proposalArray[0];

  if (!proposal || proposalSamples === undefined) {
    return errorPage('Proposal does not exist.');
  }

  

  return (
    <Col>
      <Alert variant="primary">
        <h5>
          Importing to shipment:<br></br>
          <strong>
            {proposalName} - {shipping.shippingName}
          </strong>
        </h5>
      </Alert>
      <Row>
        <CSVShippingImporter
          proposalName={proposalName}
          proposal={proposal}
          shipping={shipping}
          proposalSamples={proposalSamples}
        ></CSVShippingImporter>
      </Row>
    </Col>
  );
}

export function CSVShippingImporter({
  shipping,
  proposal,
  proposalSamples,
  proposalName,
}: {
  shipping: Shipping;
  proposal: ProposalDetail;
  proposalSamples: ProposalSample[];
  proposalName: string;
}) {
  const columns = useShipmentColumns();
  //const [columns, setColumns] = useState(useShipmentColumns());
  const [data, setData] = useState<Line[] | undefined>(undefined);
  const [autoReplacements, setAutoReplacements] = useState<AutoReplacement[]>(
    []
  );
  const [done, setDone] = useState<string | undefined>(undefined);
  const { site, token } = useAuth();

  const onCSVLoaded = (newData: Line[]) => {
    const autoReplacements = autofixShipping(
      newData,
      shipping,
      proposalSamples,
      columns
    );
    setData(newData);
    setAutoReplacements(autoReplacements);
  };

  const onDataChange = (
    changes: { row: number; col: number; newValue: Value }[]
  ) => {
    const newData: Line[] = JSON.parse(JSON.stringify(data));
    changes.forEach((c) => {
      newData[c.row][c.col] = c.newValue;
    });
    setData(newData);
    // remove deprecated autoReplacements
    setAutoReplacements(
      autoReplacements.filter((r) => r.oldValue === newData[r.row][r.col])
    );
  };

  const applyAutoReplacements = (
    data: Line[],
    autoReplacements: AutoReplacement[]
  ) => {
    const replacedData: Line[] = JSON.parse(JSON.stringify(data));
    autoReplacements.forEach((r) => {
      if (replacedData[r.row][r.col] === r.oldValue)
        replacedData[r.row][r.col] = r.newValue;
    });
    return replacedData;
  };

  const importData = () => {
    if (data) {
      const parcels = parseShippingCSV(data, proposal, columns);
      const req = addDewarsToShipping({
        proposalName,
        shippingId: shipping.shippingId,
        data: parcels,
      });
      const fullUrl = `${site.host}${site.apiPrefix}/${token}${req.url}`;
      axios.post(fullUrl, req.data, { headers: req.headers }).then(
        () => {
          setDone('success');
        },
        () => {
          setDone('danger');
        }
      );
    }
  };

  const papaparseOptions = {
    header: false,
    dynamicTyping: true,
    skipEmptyLines: true,
    comments: '#',
  };



  let dataElem = <></>;

  if (done) {
    return (
      <Alert variant={done}>
        <h5>
          {done === 'success'
            ? 'Successfully updated the shipment.'
            : 'Failed to update the shipment.'}
        </h5>
        <h5>{'You can close this page.'}</h5>
      </Alert>
    );
  } else if (data) {
    const replacedData = applyAutoReplacements(data, autoReplacements);

    const errors = validateShipping(
      replacedData,
      shipping,
      proposal,
      proposalSamples,
      columns
    );

    dataElem = (
      <Col>
        <CSVShippingImporterTable
          onDataChange={onDataChange}
          proposal={proposal}
          shipping={shipping}
          proposalSamples={proposalSamples}
          data={replacedData}
          autoReplacements={autoReplacements}
          errors={errors}
        ></CSVShippingImporterTable>
        <Row style={{ marginTop: 10 }}>
          <Col></Col>
          {autoReplacements.length ? (
            <Col md={'auto'}>
              <Button
                onClick={() => {
                  setData(replacedData);
                  setAutoReplacements([]);
                }}
                variant={'warning'}
              >
                <FontAwesomeIcon
                  style={{ marginRight: 10 }}
                  icon={faCheck}
                ></FontAwesomeIcon>
                {'Accept auto replacements'}
              </Button>
            </Col>
          ) : null}
          <Col md={'auto'}>
            <Button
              disabled={errors.length > 0 || autoReplacements.length > 0}
              onClick={importData}
            >
              <FontAwesomeIcon
                style={{ marginRight: 10 }}
                icon={faSave}
              ></FontAwesomeIcon>
              {errors.length > 0
                ? 'Fix errors to finalize import'
                : autoReplacements.length > 0
                ? 'Accept auto replacements to finalize import'
                : 'Finalize import'}
            </Button>
          </Col>
        </Row>
      </Col>
    );
  }

  return (
    <Col>
      <Row>
        <CSVReader
          cssInputClass="form-control form-control-sm"
          label={'Choose import source file'}
          cssLabelClass="form-label"
          parserOptions={papaparseOptions}
          onFileLoaded={onCSVLoaded}
        />
      </Row>
      <Row>
        <small>
          Do you need help? Click{' '}
          <a
            target="_blank"
            href="https://github.com/ispyb/EXI/wiki/Fill-shipment-from-CSV"
            rel="noreferrer"
          >
            here
          </a>
          . Examples can be found here:{' '}
          <a
            target="_blank"
            href="https://raw.githubusercontent.com/ispyb/EXI/master/csv/example3.csv"
            rel="noreferrer"
          >
            example.csv
          </a>
        </small>
      </Row>
      <Row>
        {[
          'Parcel Name should be unique for this shipment',
          'Container name should be unique for this shipment',
          'Protein + sample name should be unique for the whole proposal',
          'Sample name field is mandatory and no special characters are allowed',
          'Only Unipuck container type at MAX IV',
        ].map((m) => (
          <Col key={m} md={'auto'} style={{ padding: 5 }}>
            <Alert style={{ padding: 5, margin: 0 }} variant="info">
              <FontAwesomeIcon
                style={{ marginRight: 5 }}
                icon={faExclamationTriangle}
              ></FontAwesomeIcon>
              <small>{m} </small>
            </Alert>
          </Col>
        ))}
      </Row>
      <div
        style={{
          height: 2,
          marginTop: 10,
          marginBottom: 20,
          backgroundColor: '#c3c3c3de',
        }}
      ></div>
      {dataElem}
    </Col>
  );
}

const lastColor: { [column: number]: number } = {};
const maxColor = 8;
const valueColors: { [key: string]: number } = {};

const getNextColorForColumn = (column: number) => {
  let next = 1;
  if (column in lastColor) {
    const last = lastColor[column];
    if (last < maxColor) {
      next = last + 1;
    }
  }
  lastColor[column] = next;
  return next;
};

const getClassForValue = (
  column: number,
  value: string | number | undefined
) => {
  if (value === undefined || String(value).trim().length === 0) {
    return '';
  }
  const key = `column=${column}+value=${value}`;
  if (key in valueColors) {
    return `color${valueColors[key]}`;
  } else {
    const newValueColor = getNextColorForColumn(column);
    valueColors[key] = newValueColor;
    return `color${newValueColor}`;
  }
};

export function initColumns(columnsCSV:string[], proposal:ProposalDetail) : Handsontable.ColumnSettings[] {
  let results : Handsontable.ColumnSettings[] = [];
  
  columnsCSV.forEach((col) => {
  
    switch(col){
      case 'parcel name':
        results.push({title: 'Parcel<br />Name'});
        break;
      case 'container name':
        results.push({title: 'Container<br />Name'});
        break;
      case 'container type':
        results.push({
          title: 'Container<br />Type',
          type: 'autocomplete',
          source: CONTAINER_TYPES.map((c) => String(c)),
          strict: true,
          allowInvalid: false,
          filter: true,
        });
        break;
      case 'container position':
        results.push({title: 'Container<br />Position'});
        break;
      case 'protein acronym':
        results.push({
          title: 'Protein<br />Acronym',
          type: 'autocomplete',
          source: _(proposal.proteins)
            .map((p) => p.acronym)
            .uniq()
            .value(),
          strict: true,
          allowInvalid: false,
          filter: true,
        });
        break;
      case 'sample acronym':
        results.push({title: 'Sample<br />Acronym'});
        break;
      case 'pin barcode':
        results.push({title: 'Pin<br />Barcode'});
        break;
      case 'SPG':
        results.push({
          title: 'Spacegroup',
          source: [
            '',
            ..._(SPACE_GROUPS)
              .map((v) => v.name)
              .value(),
          ],
          type: 'autocomplete',
          filter: true,
          strict: true,
          allowInvalid: false,
        });
        break;
      case 'cellA':
        results.push({title: 'A'});
        break;
      case 'cellB':
        results.push({title: 'B'});
        break;
      case 'cellC':
        results.push({title: 'C'});
        break;
      case 'cellAlpha':
        results.push({title: 'Alpha'});
        break;
      case 'cellBeta':
        results.push({title: 'Beta'});
        break;
      case 'cellGamma':
        results.push({title: 'Gamma'});
        break;
      case 'experimentType':
        results.push({
          title: 'Experiment<br />Type',
          type: 'autocomplete',
          filter: true,
          strict: true,
          allowInvalid: false,
          source: EXPERIMENT_TYPES,
        });
        break;
      case 'aimed Resolution':
        results.push({title: 'Aimed<br />Resolution'});
        break;
      case 'required Resolution':
        results.push({title: 'Required<br />Resolution'});
        break;
      case 'beam diameter':
        results.push({title: 'Beam<br />Diameter'});
        break;
      case 'number of positions':
        results.push({title: 'Number of<br />positions'});
        break;
      case 'aimed multiplicity':
        results.push({title: 'Aimed<br />multiplicity'});
        break;
      case 'aimed completeness':
        results.push({title: 'Aimed<br />completeness'});
        break;
      case 'forced SPG':
        results.push({
          title: 'Forced<br />Spacegroup',
          source: [
            '',
            ..._(SPACE_GROUPS)
              .map((v) => v.name)
              .value(),
          ],
          type: 'autocomplete',
          filter: true,
          strict: true,
          allowInvalid: false,
        });
        break;
      case 'radiation sensitivity':
        results.push({title: 'Radiation<br />sensitivity'});
        break;
      case 'smiles':
        results.push({ title: 'Smiles' });
        break;
      case 'total rot. angle':
        results.push({title: 'Total<br />rot. angle'});
        break;
      case 'min osc. angle':
        results.push({title: 'Min<br />osc. angle'});
        break;
      case 'observed resolution':
        results.push({title: 'Observed<br />resolution'});
        break;
      case 'comments':
        results.push({title: 'Comments'});
        break;
      case 'exposure time':
        results.push({title: ''});
        break;
      case 'oscillation range':
        results.push({title: 'Oscillation<br />range'});
        break;
      case 'energy':
        results.push({title: 'Energy'});
        break;
      case 'transmission range':
        results.push({title: 'Transmission<br />range'});
        break;
    }
  
  });

  return results;

}

export function CSVShippingImporterTable({
  proposal,
  data,
  onDataChange,
  autoReplacements,
  errors
}: {
  shipping: Shipping;
  proposal: ProposalDetail;
  proposalSamples: ProposalSample[];
  data: (string | number | undefined)[][];
  // eslint-disable-next-line no-unused-vars
  onDataChange: (
    changes: { row: number; col: number; newValue: Value }[]
  ) => void;
  autoReplacements: AutoReplacement[];
  errors: Error[];
}) {
  const columnsCSV: string[] = useShipmentColumns();
  const generateCellProperties = (row: number, col: number): CellMeta => {
    const colorClass = getClassForValue(col, data[row][col]);
    const errorsCell = getErrorsForCell(errors, row, col);
    const autoReplacementsCell = getAutoReplacementsForCell(
      autoReplacements,
      row,
      col
    );

    const classNames = [
      ...(colorClass ? [colorClass] : []),
      ...(errorsCell.length ? ['error'] : []),
      ...(autoReplacementsCell.length ? ['replaced'] : []),
    ];
    const commentErrors = errorsCell.length
      ? errorsCell.map((e) => '- ' + e.message).join('\n')
      : undefined;
    const commentAutoReplacements = autoReplacementsCell.length
      ? autoReplacementsCell
          .map((r) => `- '${r.oldValue}' replaced by '${r.newValue}'`)
          .join('\n')
      : undefined;
    const commentValues = [commentAutoReplacements, commentErrors].filter(
      (a) => a !== undefined
    );
    const commentValue =
      commentValues.length > 1
        ? commentValues.join('\n')
        : commentValues.length
        ? commentValues[0]
        : undefined;

    const comment: CommentObject | undefined = commentValue
      ? { value: commentValue, readOnly: true }
      : undefined;
    return { className: classNames, comment };
  };

  const columns: Handsontable.ColumnSettings[] = initColumns(columnsCSV, proposal);


  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  function handleChanges(
    changes: (Handsontable.CellChange | null)[],
    source: Handsontable.ChangeSource
  ) {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const res: { row: number; col: number; newValue: any }[] = [];
    changes.forEach((c) => {
      if (c !== null) {
        const [row, prop, , newValue] = c;
        res.push({ row, col: Number(prop), newValue });
      }
    });
    onDataChange(res);
  }

  const hotTableComponent = useRef<HotTable>(null);

  return (
    <Row>
      <Col>
        <Row>
          <h5>
            {errors.length > 0
              ? 'Please fix errors before importing'
              : 'Please check content before importing.'}
          </h5>
        </Row>
        <Row>
          <small>Fields with same value have same color.</small>
        </Row>
        <Row>
          <div id="hot-app">
            <HotTable
              ref={hotTableComponent}
              rowHeights={25}
              height={min([25 * data.length + 55, 500])}
              colHeaders={true}
              rowHeaders={true}
              comments={true}
              settings={{
                data: data,
                licenseKey: 'non-commercial-and-evaluation',
                stretchH: 'all',
                fixedColumnsStart: 6,
                autoColumnSize: {
                  syncLimit: 100,
                },
                cells(row: number, col: number) {
                  return generateCellProperties(row, col);
                },
                beforeChange: (
                  changes: (Handsontable.CellChange | null)[],
                  source: Handsontable.ChangeSource
                ) => {
                  if (changes) handleChanges(changes, source);
                },
              }}
            >
              {columns.map((c) => (
                <HotColumn key={c.title} settings={c}></HotColumn>
              ))}
            </HotTable>
          </div>
        </Row>
        {errors.length > 0 ? (
          <Row
            style={{
              maxHeight: 65,
              overflowY: 'scroll',
              backgroundColor: 'rgb(195 195 195 / 22%)',
              borderBottom: '2px solid #c3c3c3de',
              marginRight: 0,
              marginLeft: 0,
            }}
          >
            <Col>
              <Row>
                <small>
                  {errors.length} validation errors occurred. Click on them to
                  see data:
                </small>
              </Row>
              <Row>
                {_(errors)
                  .map((e) => (
                    <Col
                      key={`${e.row}-${e.col}-${e.message}`}
                      md={'auto'}
                      style={{ padding: 5 }}
                    >
                      <Button
                        onClick={() => {
                          hotTableComponent?.current?.hotInstance?.selectCell(
                            e.row,
                            e.col
                          );
                        }}
                        style={{ padding: 1 }}
                        size={'sm'}
                        variant={'danger'}
                      >
                        <FontAwesomeIcon
                          style={{ marginRight: 5 }}
                          icon={faExclamationTriangle}
                        ></FontAwesomeIcon>
                        <strong>{e.message}</strong>
                      </Button>
                    </Col>
                  ))
                  .value()}
              </Row>
            </Col>
          </Row>
        ) : null}
        {autoReplacements.length > 0 ? (
          <Row
            style={{
              maxHeight: 65,
              overflowY: 'scroll',
              backgroundColor: 'rgb(195 195 195 / 22%)',
              borderBottom: '2px solid #c3c3c3de',
              marginRight: 0,
              marginLeft: 0,
            }}
          >
            <Col>
              <Row>
                <small>
                  {autoReplacements.length} values have been replaced
                  automatically to fix errors. Click on them to see data:
                </small>
              </Row>
              <Row>
                {_(autoReplacements)
                  .map((r) => (
                    <Col
                      key={`${r.row}-${r.col}-${r.oldValue}-${r.newValue}`}
                      md={'auto'}
                      style={{ padding: 5 }}
                    >
                      <Button
                        onClick={() => {
                          hotTableComponent?.current?.hotInstance?.selectCell(
                            r.row,
                            r.col
                          );
                        }}
                        style={{ padding: 1 }}
                        size={'sm'}
                        variant={'warning'}
                      >
                        <small>{`'${r.oldValue}' replaced by '${r.newValue}'`}</small>
                      </Button>
                    </Col>
                  ))
                  .value()}
              </Row>
            </Col>
          </Row>
        ) : null}
      </Col>
    </Row>
  );
}
