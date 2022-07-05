import React from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import { SET_SESSIONS_MX_COLUMNS, SET_SESSIONS_SAXS_COLUMNS, SET_SESSIONS_EM_COLUMNS, SET_SESSIONS_SSX_COLUMNS } from 'redux/actiontypes';
import { setTechniqueVisibleSessionTable } from 'redux/actions/ui';
import useResponsiveColumns from 'hooks/bootstraptable';
import SessionTableMenu from 'pages/session/sessiontablemenu';
import SessionTableColumns from 'pages/session/sessiontablecolumns';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Session } from 'pages/model';
import filterFactory from 'react-bootstrap-table2-filter';
import BootstrapTable from 'react-bootstrap-table-next';
import { Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface Props {
  data?: Session[];
  areMXColumnsVisible?: boolean;
  areSSXColumnsVisible?: boolean;
  areSAXSColumnsVisible?: boolean;
  areEMColumnsVisible?: boolean;
  startDate?: string;
  // eslint-disable-next-line no-unused-vars
  setStartDate?: (_: string) => void;
  endDate?: string;
  // eslint-disable-next-line no-unused-vars
  setEndDate?: (_: string) => void;
  userPortalLink: { visible: boolean; header: string; url: string; toolTip: string };
  showDatePicker?: boolean;
  showEmptySessions: boolean;
  // eslint-disable-next-line no-unused-vars
  setShowEmptySessions: (_: boolean) => void;
}

export default function SessionTable({
  data,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  areMXColumnsVisible = true,
  areSSXColumnsVisible = true,
  areSAXSColumnsVisible = true,
  areEMColumnsVisible = true,
  userPortalLink,
  showDatePicker = true,
  showEmptySessions,
  setShowEmptySessions,
}: Props) {
  const responsiveColumns = useResponsiveColumns(
    SessionTableColumns({
      areMXColumnsVisible,
      areSSXColumnsVisible,
      areSAXSColumnsVisible,
      areEMColumnsVisible,
      userPortalLink,
    })
  );

  return (
    <>
      <SessionTableMenu
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        showDatePicker={showDatePicker}
        showEmptySessions={showEmptySessions}
        setShowEmptySessions={setShowEmptySessions}
        checkList={[
          { text: 'MX', checked: areMXColumnsVisible, action: setTechniqueVisibleSessionTable, actionType: SET_SESSIONS_MX_COLUMNS },
          { text: 'SSX', checked: areSSXColumnsVisible, action: setTechniqueVisibleSessionTable, actionType: SET_SESSIONS_SSX_COLUMNS },
          { text: 'SAXS', checked: areSAXSColumnsVisible, action: setTechniqueVisibleSessionTable, actionType: SET_SESSIONS_SAXS_COLUMNS },
          { text: 'EM', checked: areEMColumnsVisible, action: setTechniqueVisibleSessionTable, actionType: SET_SESSIONS_EM_COLUMNS },
        ]}
      />
      {data && data.length ? (
        <BootstrapTable
          bootstrap4
          filter={filterFactory()}
          keyField="SessionTableToolkitProvider"
          data={data}
          columns={responsiveColumns}
          pagination={paginationFactory({ showTotal: true, sizePerPage: 20 })}
        />
      ) : (
        <Alert variant="info">
          <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: 10 }} />
          No session found.
        </Alert>
      )}
    </>
  );
}
