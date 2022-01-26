import React from 'react';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min';
import { SET_SESSIONS_MX_COLUMNS, SET_SESSIONS_SAXS_COLUMNS, SET_SESSIONS_EM_COLUMNS } from 'redux/actiontypes';
import { setTechniqueVisibleSessionTable } from 'redux/actions/ui';

import BootstrapTable2 from 'react-bootstrap-table-next';
import useResponsiveColumns from 'hooks/bootstraptable';
import SessionTableMenu from 'pages/session/sessiontablemenu';
import columns from 'pages/session/columnssessiontable';

const { SearchBar } = Search;

export default function SessionTable(props) {
  const { data, areMXColumnsVisible = true, areSAXSColumnsVisible = true, areEMColumnsVisible = true } = props;
  const responsiveColumns = useResponsiveColumns(columns(props, areMXColumnsVisible, areSAXSColumnsVisible, areEMColumnsVisible));

  return (
    <ToolkitProvider
      keyField="id"
      data={data}
      columns={responsiveColumns}
      search={{
        searchFormatted: true,
      }}
    >
      {(props) => (
        <>
          <SessionTableMenu
            SearchMenu={<SearchBar {...props.searchProps} />}
            items={[
              { text: 'MX', checked: areMXColumnsVisible, action: setTechniqueVisibleSessionTable, actionType: SET_SESSIONS_MX_COLUMNS },
              { text: 'SAXS', checked: areSAXSColumnsVisible, action: setTechniqueVisibleSessionTable, actionType: SET_SESSIONS_SAXS_COLUMNS },
              { text: 'EM', checked: areEMColumnsVisible, action: setTechniqueVisibleSessionTable, actionType: SET_SESSIONS_EM_COLUMNS },
            ]}
          />
          <BootstrapTable2 {...props.baseProps} />
        </>
      )}
    </ToolkitProvider>
  );
}